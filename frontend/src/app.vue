<template>
  <div class="p-4">
    <h1 class="main-title">城市交通时空特征可视化大屏 (Vue版)</h1>
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4 h-[calc(100vh-120px)]">
      
      <!-- 左侧栏 -->
      <div class="lg:col-span-1 flex flex-col gap-4">
        <div class="card">
          <h2 class="text-xl font-bold text-white mb-2">功能面板</h2>
          <div class="flex flex-col gap-4">
            <button @click="handleToggleTrafficLayer" class="btn">显示/隐藏实时路况</button>
            <button @click="handleToggleMonitoringAreas" class="btn btn-secondary">显示/隐藏监控区域</button>
            <button @click="handleClearAll" class="btn btn-secondary">清除所有覆盖物</button>
          </div>
        </div>
        <div class="card">
          <h2 class="text-xl font-bold text-white mb-2">车辆轨迹模拟</h2>
          <div class="flex flex-col gap-3">
            <div>
              <label class="text-sm font-medium">起点</label>
              <input type="text" id="start-point-input" class="input-field mt-1" placeholder="搜索并选择起点">
            </div>
            <div id="waypoints-container">
                <!-- 途经点将动态添加到这里 -->
                <div v-for="(waypoint, index) in waypoints" :key="waypoint.id" class="flex items-center gap-2 mt-2">
                    <input type="text" :id="waypoint.id" class="input-field" :placeholder="`搜索途经点 ${index + 1}`">
                    <button @click="removeWaypoint(index)" class="btn btn-secondary text-sm p-2">-</button>
                </div>
            </div>
            <div>
              <label class="text-sm font-medium">终点</label>
              <input type="text" id="end-point-input" class="input-field mt-1" placeholder="搜索并选择终点">
            </div>
            <div class="flex justify-between gap-2">
              <button @click="addWaypoint" class="btn btn-secondary flex-grow">添加途经点</button>
              <button @click="handlePlanRoute" class="btn flex-grow">规划路线</button>
            </div>
          </div>
        </div>
        <div class="card flex-grow">
          <h2 class="text-xl font-bold text-white mb-2">周客流量分布 (模拟数据)</h2>
          <div ref="weeklyFlowChartRef" class="chart-container"></div>
        </div>
      </div>

      <!-- 中间地图 -->
      <div class="lg:col-span-3 card p-2">
        <div id="map-container" ref="mapContainerRef"></div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';

// --- 响应式状态定义 ---
const mapContainerRef = ref(null);
const weeklyFlowChartRef = ref(null);
const waypoints = ref([]);

let map;
let trafficLayer;
let isTrafficLayerVisible = false;
const monitoringAreaOverlays = [];
let areMonitoringAreasVisible = false;
let routeOverlays = [];
const routeLocations = { start: null, end: null, waypoints: [] };

// --- 配置常量 ---
const TARGET_DISTRICTS = ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '通州区', '顺义区'];
const DISTRICT_COLORS = ['#FF33FF', '#33A1FF', '#33FF66', '#FFFF33', '#FF6633', '#33FFFF', '#FF3366'];

// --- 功能函数 ---

const loadAmapScript = async () => {
  try {
    const res = await fetch('/api/config/amap-js-key');
    if (!res.ok) throw new Error('获取Key失败');
    const { key } = await res.json();
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error("加载高德地图脚本失败:", error);
    alert("无法加载地图，请刷新页面重试。");
  }
};

const initMap = () => {
  return new Promise((resolve) => {
    map = new AMap.Map(mapContainerRef.value, {
      zoom: 10,
      center: [116.407428, 39.90423],
      viewMode: '3D',
      mapStyle: 'amap://styles/darkblue',
    });

    map.on('complete', () => {
      console.log("地图加载完成");
      AMap.plugin(['AMap.Polygon', 'AMap.Polyline', 'AMap.Marker', 'AMap.InfoWindow', 'AMap.AutoComplete'], () => {
        trafficLayer = new AMap.TileLayer.Traffic({ zIndex: 10 });
        map.add(trafficLayer);
        trafficLayer.show();
        isTrafficLayerVisible = true;
        resolve();
      });
    });
  });
};

const initChart = () => {
  const chart = echarts.init(weeklyFlowChartRef.value);
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLine: { lineStyle: { color: '#8392A2' } } },
    yAxis: { type: 'value', name: '客流量 (万人次)', axisLine: { lineStyle: { color: '#8392A2' } }, splitLine: { lineStyle: { color: 'rgba(131, 146, 162, 0.2)' } } },
    series: [{
      data: [120, 132, 101, 134, 150, 230, 210], type: 'line', smooth: true, itemStyle: { color: '#00aaff' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(0, 170, 255, 0.5)' }, { offset: 1, color: 'rgba(0, 170, 255, 0)' }]) }
    }],
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
  };
  chart.setOption(option);
};

const handleToggleTrafficLayer = () => {
  if (!trafficLayer) return;
  isTrafficLayerVisible ? trafficLayer.hide() : trafficLayer.show();
  isTrafficLayerVisible = !isTrafficLayerVisible;
};

const parsePolyline = (polylineStr) => {
    const allPaths = [];
    if (!polylineStr) return allPaths;
    const landmassStrings = polylineStr.split('|');
    for (const landmassStr of landmassStrings) {
        const pointStrings = landmassStr.split(';');
        const path = [];
        for (const pointStr of pointStrings) {
            const lngLat = pointStr.split(',');
            if (lngLat.length === 2) {
                path.push(new AMap.LngLat(parseFloat(lngLat[0]), parseFloat(lngLat[1])));
            }
        }
        if (path.length > 0) {
            allPaths.push(path);
        }
    }
    return allPaths;
}

const handleToggleMonitoringAreas = async () => {
    if (areMonitoringAreasVisible) {
        map.remove(monitoringAreaOverlays);
        areMonitoringAreasVisible = false;
        return;
    }
    if (monitoringAreaOverlays.length > 0) {
        map.add(monitoringAreaOverlays);
        map.setFitView(monitoringAreaOverlays);
        areMonitoringAreasVisible = true;
        return;
    }
    try {
        monitoringAreaOverlays.length = 0;
        for (let i = 0; i < TARGET_DISTRICTS.length; i++) {
            const districtName = TARGET_DISTRICTS[i];
            const response = await fetch(`/api/district/bounds?district=${districtName}`);
            const data = await response.json();
            if (data.status === '1' && data.polyline) {
                const color = DISTRICT_COLORS[i];
                const paths = parsePolyline(data.polyline);
                paths.forEach(path => {
                    if (path.length > 0) {
                        monitoringAreaOverlays.push(new AMap.Polygon({ path, strokeColor: color, strokeWeight: 2, strokeOpacity: 0.8, fillColor: color, fillOpacity: 0.2, zIndex: 10 }));
                    }
                });
            } else {
                console.error(`获取 [${districtName}] 边界失败:`, data.msg || '未知原因');
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        if (monitoringAreaOverlays.length > 0) {
            map.add(monitoringAreaOverlays);
            map.setFitView(monitoringAreaOverlays);
            areMonitoringAreasVisible = true;
        }
    } catch (error) {
        console.error("加载监控区域时发生网络错误:", error);
    }
};

const setupAutocomplete = () => {
    const startInput = document.getElementById('start-point-input');
    const endInput = document.getElementById('end-point-input');
    const startAutocomplete = new AMap.AutoComplete({ input: startInput, city: '北京' });
    const endAutocomplete = new AMap.AutoComplete({ input: endInput, city: '北京' });

    startAutocomplete.on('select', (e) => {
        if (e.poi && e.poi.location) routeLocations.start = e.poi.location;
    });
    endAutocomplete.on('select', (e) => {
        if (e.poi && e.poi.location) routeLocations.end = e.poi.location;
    });
};

const addWaypoint = async () => {
    const id = `waypoint-input-${Date.now()}`;
    waypoints.value.push({ id });

    await nextTick(); // 等待DOM更新

    const inputElement = document.getElementById(id);
    const autocomplete = new AMap.AutoComplete({ input: inputElement, city: '北京' });
    autocomplete.on('select', (e) => {
        if (e.poi && e.poi.location) {
            const existing = routeLocations.waypoints.find(wp => wp.id === id);
            if (existing) {
                existing.location = e.poi.location;
            } else {
                routeLocations.waypoints.push({ id, location: e.poi.location });
            }
        }
    });
};

const removeWaypoint = (index) => {
    const removedWaypoint = waypoints.value.splice(index, 1)[0];
    routeLocations.waypoints = routeLocations.waypoints.filter(wp => wp.id !== removedWaypoint.id);
};

const handlePlanRoute = async () => {
    if (routeOverlays.length > 0) map.remove(routeOverlays);
    routeOverlays = [];

    if (!routeLocations.start || !routeLocations.end) {
        alert('请选择起点和终点');
        return;
    }

    const origin = `${routeLocations.start.lng},${routeLocations.start.lat}`;
    const destination = `${routeLocations.end.lng},${routeLocations.end.lat}`;
    const waypointsStr = routeLocations.waypoints.map(wp => `${wp.location.lng},${wp.location.lat}`).join(';');
    
    try {
        const response = await fetch(`/api/route/driving?origin=${origin}&destination=${destination}&waypoints=${waypointsStr}`);
        const data = await response.json();
        if (data.status === '1' && data.polyline) {
            const path = parsePolyline(data.polyline);
            const routeLine = new AMap.Polyline({ path: path[0], strokeColor: "#3366FF", strokeOpacity: 0.8, strokeWeight: 8, showDir: true, zIndex: 50 });
            const startMarker = new AMap.Marker({ position: routeLocations.start, icon: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker.png', offset: new AMap.Pixel(-13, -30) });
            const endMarker = new AMap.Marker({ position: routeLocations.end, icon: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/dir-marker-end.png', offset: new AMap.Pixel(-13, -30) });
            
            map.add([routeLine, startMarker, endMarker]);
            map.setFitView([routeLine, startMarker, endMarker]);
            routeOverlays.push(routeLine, startMarker, endMarker);
        } else {
            alert('路径规划失败: ' + (data.reason || '未知错误'));
        }
    } catch (error) {
        console.error("路径规划请求失败:", error);
    }
};

const handleClearAll = () => {
    if (areMonitoringAreasVisible) {
        map.remove(monitoringAreaOverlays);
        areMonitoringAreasVisible = false;
    }
    if (routeOverlays.length > 0) {
        map.remove(routeOverlays);
        routeOverlays = [];
    }
};

// --- Vue生命周期钩子 ---
onMounted(async () => {
  await loadAmapScript();
  await initMap();
  initChart();
  setupAutocomplete();
});
</script>
