// =================================================================
// 文件: /backend/data_collector.js
// 描述: 一个独立的数据采集脚本，用于从高德API获取数据并存入数据库。
// 更新: 现在会采集每个分类的前10页数据。
// =================================================================
require('dotenv').config();
const axios = require('axios');
const db = require('./config/database');

// 导入所有模型
const POI = require('./core/models/poi');
const RoadTraffic = require('./core/models/road_traffic');
const Weather = require('./core/models/weather');

// 高德Web服务API的Key
const AMAP_KEY = process.env.AMAP_KEY;
const AMAP_API_BASE_URL = 'https://restapi.amap.com/v3';

// --- 配置采集参数 ---
const TARGET_CITY = '北京';
const TARGET_ADCODE = '110000'; // 北京的adcode
const TARGET_RECTANGLE = '116.354,39.923;116.384,39.893'; 

const POI_CATEGORIES = [
    { name: '购物', keyword: '商场|购物中心|超市' },
    { name: '教育', keyword: '大学|中学|小学' },
    { name: '医疗', keyword: '医院|诊所' },
    { name: '交通', keyword: '地铁站|公交站' },
    { name: '餐饮', keyword: '餐厅|饭店|美食' },
    { name: '公司', keyword: '公司|企业|科技园' }
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 采集POI数据并存入数据库
 */
async function collectPois() {
    console.log('--- 开始采集POI数据 ---');
    for (const category of POI_CATEGORIES) {
        try {
            console.log(`正在采集 [${category.name}] 分类...`);
            let totalCollected = 0;
            // --- 更新：循环采集10页 ---
            for (let page = 1; page <= 10; page++) {
                console.log(`  - 正在采集第 ${page} 页...`);
                const response = await axios.get(`${AMAP_API_BASE_URL}/place/text`, {
                    params: {
                        key: AMAP_KEY,
                        keywords: category.keyword,
                        city: TARGET_CITY,
                        output: 'json',
                        page_size: 25,
                        page_num: page // 使用循环变量作为页码
                    }
                });

                if (response.data.status === '1' && response.data.pois.length > 0) {
                    for (const poi of response.data.pois) {
                        if (!poi.location || typeof poi.location !== 'string' || !poi.location.includes(',')) continue;
                        
                        const [lng, lat] = poi.location.split(',');
                        
                        await POI.findOrCreate({
                            where: { poiId: poi.id },
                            defaults: {
                                poiId: poi.id,
                                name: poi.name,
                                category: category.name,
                                type: poi.type,
                                address: poi.address,
                                location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                                city: TARGET_CITY,
                            }
                        });
                    }
                    totalCollected += response.data.pois.length;
                } else {
                    // 如果某一页没有数据了，就提前结束这个分类的采集
                    console.log(`  - 第 ${page} 页没有更多数据，结束 [${category.name}] 的采集。`);
                    break; 
                }
                await delay(500); // 每次请求后延迟500毫秒
            }
            console.log(`[${category.name}] 分类采集成功，共处理 ${totalCollected} 条数据。`);

        } catch (error) {
            console.error(`采集 [${category.name}] 分类时出错:`, error.message);
        }
    }
    console.log('--- POI数据采集完成 ---');
}

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

    await collectPois();
    await collectRoadTraffic();
    await collectWeather();

    console.log('\n所有数据采集任务执行完毕！');
    
    await db.close();
}

main();
