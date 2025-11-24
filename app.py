import streamlit as st
import yfinance as yf
import pandas as pd
import time
from datetime import datetime
import pytz

# --- 1. 页面基础配置 ---
st.set_page_config(
    page_title="全球投资指挥中心 Pro", 
    layout="wide", 
    page_icon="📈",
    initial_sidebar_state="collapsed"
)

# 注入自定义CSS：实现新闻滚动效果、调整卡片样式
st.markdown("""
    <style>
    /* 指标卡片样式 */
    .metric-container {
        background-color: #1E1E1E;
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #333;
        margin-bottom: 10px;
        text-align: center;
        transition: transform 0.2s;
    }
    .metric-container:hover {
        transform: scale(1.02);
        border-color: #555;
    }
    /* 链接样式去下划线，颜色适配 */
    a { text-decoration: none; color: #4FA1D8 !important; font-weight: bold; }
    a:hover { text-decoration: underline; color: #FF4B4B !important; }
    
    /* Streamlit 原生 Metric 调整 */
    [data-testid="stMetricValue"] { font-size: 1.5rem; }
    [data-testid="stMetricDelta"] svg { display: none; } /* 隐藏箭头，用颜色区分 */
    </style>
    """, unsafe_allow_html=True)

st.title("🚀 全球投资指挥中心 Pro (Live)")
st.caption(f"最后更新时间 (北京): {datetime.now(pytz.timezone('Asia/Shanghai')).strftime('%Y-%m-%d %H:%M:%S')} | 数据源: Yahoo Finance")

# --- 2. 定义数据源 (含新增的指数和期货) ---
# 格式: "显示名称": {"symbol": "代码", "url": "原文链接(用于跳转)"}
TICKERS_CONFIG = {
    "A股核心": {
        "🇨🇳 上证指数": {"sym": "000001.SS", "desc": "大盘风向标"},
        "🇨🇳 深证成指": {"sym": "399001.SZ", "desc": "深市代表"},
        "🚀 创业板指": {"sym": "399006.SZ", "desc": "成长股/科技股风向"}, # 新增
    },
    "美股核心": {
        "🇺🇸 标普500": {"sym": "^GSPC", "desc": "美股基准"},
        "💻 纳斯达克": {"sym": "^IXIC", "desc": "科技股风向"}, # 新增
        "😨 恐慌指数": {"sym": "^VIX", "desc": "市场风险偏好"},
    },
    "美股期货 (夜盘风向)": { # 新增板块
        "🇺🇸 标普期货": {"sym": "ES=F", "desc": "S&P 500 Futures"},
        "🇺🇸 纳指期货": {"sym": "NQ=F", "desc": "Nasdaq 100 Futures"},
        "🇺🇸 道指期货": {"sym": "YM=F", "desc": "Dow Jones Futures"},
    },
    "全球资产": {
        "🟡 黄金期货": {"sym": "GC=F", "desc": "避险资产"},
        "₿ 比特币": {"sym": "BTC-USD", "desc": "加密货币龙头"},
        "💱 美元/人民币": {"sym": "CNY=X", "desc": "汇率波动"},
    }
}

# --- 3. 获取市场数据的函数 ---
@st.cache_data(ttl=30) # 缓存30秒
def get_market_data_batch():
    # 提取所有代码进行批量请求
    all_symbols = []
    for category in TICKERS_CONFIG.values():
        for item in category.values():
            all_symbols.append(item['sym'])
    
    # 一次性下载，提高速度
    try:
        data = yf.download(all_symbols, period="2d", progress=False)['Close']
        return data
    except Exception as e:
        st.error(f"数据获取失败: {e}")
        return pd.DataFrame()

# --- 4. 获取实时新闻的函数 ---
@st.cache_data(ttl=300) # 新闻缓存5分钟
def get_real_news():
    # 使用 SPY (标普ETF) 和 000001.SS 的新闻流作为全球宏观代表
    news_items = []
    try:
        # 获取美股/全球宏观新闻
        us_ticker = yf.Ticker("^GSPC")
        if us_ticker.news:
            news_items.extend(us_ticker.news)
    except:
        pass
    
    return news_items

# --- 5. 渲染界面逻辑 ---

# >>> 模块 A: 市场指标看板 <<<
df_prices = get_market_data_batch()

if not df_prices.empty:
    for category_name, items in TICKERS_CONFIG.items():
        st.subheader(f"📌 {category_name}")
        cols = st.columns(len(items)) # 根据每组的数量动态分列
        
        for idx, (name, info) in enumerate(items.items()):
            symbol = info['sym']
            desc = info['desc']
            # Yahoo Finance 原文链接
            source_url = f"https://finance.yahoo.com/quote/{symbol}"
            
            with cols[idx]:
                try:
                    # 获取价格
                    if symbol in df_prices.columns:
                        # yfinance 返回的是多级索引或单列，处理兼容性
                        series = df_prices[symbol]
                        curr = series.iloc[-1]
                        prev = series.iloc[-2]
                        change = curr - prev
                        pct = (change / prev) * 100
                        
                        # 颜色反转：符合中国习惯 (红涨绿跌)
                        color = "inverse" if change > 0 else "normal"
                        
                        # 使用自定义 HTML 结构实现点击跳转
                        st.markdown(f"""
                        <div class="metric-container">
                            <a href="{source_url}" target="_blank" title="点击查看 {name} 原文图表">
                                <div style="color: #888; font-size: 0.8em;">{desc}</div>
                                <div style="font-size: 1.1em; margin-bottom: 5px;">{name} 🔗</div>
                            </a>
                        </div>
                        """, unsafe_allow_html=True)
                        
                        st.metric(
                            label="", # 标题已经在上面自定义了
                            value=f"{curr:,.2f}",
                            delta=f"{change:+.2f} ({pct:+.2f}%)",
                            delta_color=color
                        )
                    else:
                        st.warning("无数据")
                except Exception as e:
                    st.info("加载中...")

st.divider()

# >>> 模块 B: 实时滚动新闻 & 经济数据 <<<
col_news, col_data = st.columns([2, 1])

with col_news:
    st.header("📰 全球财经快讯 (实时)")
    st.info("💡 提示：点击标题可直接跳转至新闻源阅读全文")
    
    news_list = get_real_news()
    
    # 创建一个可滚动的容器 (查看历史)
    with st.container(height=400, border=True):
        if news_list:
            for news in news_list:
                # 解析时间戳
                pub_time = datetime.fromtimestamp(news['providerPublishTime'], pytz.timezone('Asia/Shanghai'))
                time_str = pub_time.strftime('%m-%d %H:%M')
                title = news['title']
                link = news['link']
                publisher = news['publisher']
                
                # 新闻条目布局
                st.markdown(f"""
                **{time_str}** | <a href="{link}" target="_blank">{title}</a>  
                <span style='color:grey; font-size:0.8em'>来源: {publisher}</span>
                """, unsafe_allow_html=True)
                st.markdown("---")
        else:
            st.write("暂无最新新闻，请稍后刷新。")

with col_data:
    st.header("📅 经济数据 & 工具")
    
    # 这里使用外部链接，因为免费API很难获取实时日历数据
    st.markdown("""
    **常用数据源 (点击直达):**
    
    * 🇨🇳 [中国国家统计局数据](https://data.stats.gov.cn/)
    * 🇺🇸 [美联储 FRED 数据库](https://fred.stlouisfed.org/)
    * 📅 [Investing.com 财经日历](https://cn.investing.com/economic-calendar/)
    * 🌊 [CNBC 全球市场热图](https://www.cnbc.com/world-markets/)
    """)
    
    st.warning("🔔 下周重点关注:")
    st.markdown("""
    - **周二**: 美国 CPI 通胀数据
    - **周四**: 美联储初请失业金人数
    - **周五**: 中国 制造业 PMI
    """)
    
    # 简单的计算器工具示例
    with st.expander("🧮 汇率换算器 (USD -> CNY)"):
        usd_amount = st.number_input("美元金额", value=100)
        if 'CNY=X' in df_prices:
            rate = df_prices['CNY=X'].iloc[-1]
            st.write(f"≈ {usd_amount * rate:,.2f} 人民币")

# 底部手动刷新
if st.button("🔄 刷新所有数据"):
    st.rerun()
