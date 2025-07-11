// =================================================================
// 文件: /backend/data_collector.js
// 描述: 一个独立的数据采集脚本，用于从高德API获取数据并存入数据库。
// 更新: 移除了所有与POI（兴趣点）相关的采集逻辑。
// =================================================================
require('dotenv').config();
const axios = require('axios');
const db = require('./config/database');

// 导入模型
const RoadTraffic = require('./core/models/road_traffic');
const Weather = require('./core/models/weather');

// 高德Web服务API的Key
const AMAP_KEY = process.env.AMAP_KEY;
const AMAP_API_BASE_URL = 'https://restapi.amap.com/v3';

// --- 配置采集参数 ---
const TARGET_CITY = '北京';
const TARGET_ADCODE = '110000'; // 北京的adcode
const TARGET_RECTANGLE = '116.354,39.923;116.384,39.893'; 

// POI相关的采集逻辑已被移除
// const POI_CATEGORIES = [...];
// async function collectPois() { ... }

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 采集指定区域的实时交通态势
 */
async function collectRoadTraffic() {
    console.log('\n--- 开始采集实时交通态势 ---');
    try {
        const response = await axios.get(`${AMAP_API_BASE_URL}/traffic/status/rectangle`, {
            params: { key: AMAP_KEY, rectangle: TARGET_RECTANGLE, output: 'json' }
        });

        if (response.data.status === '1' && response.data.trafficinfo) {
            const { evaluation, roads } = response.data.trafficinfo;
            const [p1, p2] = TARGET_RECTANGLE.split(';');
            const [lng1, lat1] = p1.split(',');
            const [lng2, lat2] = p2.split(',');

            await RoadTraffic.create({
                evaluation: evaluation,
                roads: roads,
                area: {
                    type: 'Polygon',
                    coordinates: [[
                        [parseFloat(lng1), parseFloat(lat1)], [parseFloat(lng2), parseFloat(lat1)],
                        [parseFloat(lng2), parseFloat(lat2)], [parseFloat(lng1), parseFloat(lat2)],
                        [parseFloat(lng1), parseFloat(lat1)]
                    ]]
                }
            });
            console.log('实时交通态势数据采集成功。');
        }
    } catch (error) {
        console.error('采集实时交通态势时出错:', error.message);
    }
}

/**
 * 采集天气数据
 */
async function collectWeather() {
    console.log('\n--- 开始采集天气数据 ---');
    try {
        const response = await axios.get(`${AMAP_API_BASE_URL}/weather/weatherInfo`, {
            params: { key: AMAP_KEY, city: TARGET_ADCODE, output: 'json' }
        });

        if (response.data.status === '1' && response.data.lives.length > 0) {
            const liveWeather = response.data.lives[0];
            await Weather.create({
                city: liveWeather.city,
                adcode: liveWeather.adcode,
                weather: liveWeather.weather,
                temperature: parseFloat(liveWeather.temperature),
                windDirection: liveWeather.winddirection,
                windPower: liveWeather.windpower,
                humidity: parseFloat(liveWeather.humidity),
                reportTime: liveWeather.reporttime,
            });
            console.log('天气数据采集成功。');
        }
    } catch (error) {
        console.error('采集天气数据时出错:', error.message);
    }
}


/**
 * 主执行函数
 */
async function main() {
    console.log('数据采集任务开始...');
    
    try {
        await db.authenticate();
        console.log('数据库连接成功。');
        await db.sync();
        console.log('数据库模型同步完成。');
    } catch (error) {
        console.error('数据库初始化失败:', error);
        return;
    }

    // await collectPois(); // POI采集调用已移除
    await collectRoadTraffic();
    await collectWeather();

    console.log('\n所有数据采集任务执行完毕！');
    
    await db.close();
}

main();
