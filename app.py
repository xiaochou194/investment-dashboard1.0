import streamlit as st
import yfinance as yf
import pandas as pd
import time
from datetime import datetime
import pytz

# 设置页面配置
st.set_page_config(page_title="全球投资指挥中心", layout="wide", page_icon="📈")

# 自动刷新 (每60秒)
if 'last_updated' not in st.session_state:
    st.session_state.last_updated = time.time()

# CSS样式优化 (让界面更像专业的金融看板)
st.markdown("""
    <style>
    .metric-card {
        background-color: #1E1E1E;
        border: 1px solid #333;
        padding: 15px;
        border-radius: 5px;
        margin-bottom: 10px;
    }
    /* 中国红涨绿跌习惯 */
    [data-testid="stMetricDelta"] svg { display: none; } 
    .st-emotion-cache-1wivap2 { font-size: 1.2rem; }
    </style>
    """, unsafe_allow_html=True)

st.title("🚀 全球投资实战看板 (Global Command Center)")
st.markdown(f"Last Updated: {datetime.now(pytz.timezone('Asia/Shanghai')).strftime('%H:%M:%S')}")

# --- 1. 获取数据的函数 ---
@st.cache_data(ttl=60)  # 缓存60秒，避免频繁请求
def get_market_data():
    tickers = {
        "🇨🇳 上证指数": "000001.SS",
        "🇨🇳 深证成指": "399001.SZ",
        "🇺🇸 标普500": "^GSPC",
        "😨 恐慌指数 (VIX)": "^VIX",
        "🟡 黄金期货": "GC=F",
        "₿ 比特币": "BTC-USD",
        "💱 美元/人民币": "CNY=X"
    }
    
    data_list = []
    # 批量获取数据
    data = yf.download(list(tickers.values()), period="2d", progress=False)
    
    for name, symbol in tickers.items():
        try:
            # 获取最新收盘价和前一日收盘价
            if symbol in data['Close']:
                current_price = data['Close'][symbol].iloc[-1]
                prev_price = data['Close'][symbol].iloc[-2]
                change = current_price - prev_price
                pct_change = (change / prev_price) * 100
                
                data_list.append({
                    "name": name,
                    "price": current_price,
                    "change": change,
                    "pct": pct_change
                })
        except Exception as e:
            pass
            
    return data_list

# --- 2. 模拟新闻数据 (由于免费新闻API难找，这里做模拟展示结构) ---
def get_news():
    # 实际项目中这里可以接入 feedparser 爬取 RSS
    return [
        {"time": "10:30", "title": "【A股】创业板指涨逾1%，新能源赛道回暖"},
        {"time": "10:15", "title": "【宏观】央行进行1000亿元7天期逆回购操作"},
        {"time": "09:45", "title": "【美股】美联储官员暗示降息可能推迟，美债收益率走高"},
        {"time": "09:00", "title": "【黄金】地缘政治风险升温，金价短线拉升突破2400美元"},
        {"time": "08:30", "title": "【数据】中国今日将公布财新制造业PMI数据"}
    ]

# --- 3. 界面布局 ---

# === 顶部：核心指标 ===
st.subheader("📊 核心市场概览")
market_data = get_market_data()

cols = st.columns(4)  # 4列布局
for i, item in enumerate(market_data):
    col = cols[i % 4]
    # 颜色处理：红涨绿跌
    color = "normal"
    if item['change'] > 0:
        delta_color = "inverse" # Streamlit默认绿涨红跌，inverse反转为红涨
    else:
        delta_color = "normal" # 绿色
        
    with col:
        st.metric(
            label=item['name'],
            value=f"{item['price']:,.2f}",
            delta=f"{item['pct']:.2f}%",
            delta_color=delta_color
        )

st.divider()

# === 中部：分栏显示 (新闻 + 财经日历) ===
col_news, col_calendar = st.columns([2, 1])

with col_news:
    st.subheader("📰 实时财经快讯")
    news_list = get_news()
    for news in news_list:
        st.markdown(f"**{news['time']}** | {news['title']}")
        st.markdown("---")

with col_calendar:
    st.subheader("📅 本周重要财经日历")
    st.info("🇺🇸 周三 20:30 - 美国CPI数据")
    st.info("🇺🇸 周四 02:00 - 美联储利率决议")
    st.warning("🇨🇳 周五 09:30 - 中国CPI/PPI数据")
    st.success("🟡 每日关注 - 黄金ETF持仓变化")

# 底部刷新按钮
if st.button('手动刷新数据'):
    st.rerun()
