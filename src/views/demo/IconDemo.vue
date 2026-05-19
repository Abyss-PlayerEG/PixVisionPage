<script setup>
// 图标演示页面 - 展示所有使用的 SVG 图标
</script>

<template>
  <div class="icon-demo">
    <h1>图标库演示</h1>
    
    <!-- 统计数据图标 -->
    <section class="demo-section">
      <h2>统计数据图标（Stats Grid）</h2>
      <div class="icon-grid">
        <div class="icon-item">
          <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="icon-label">作品</span>
        </div>
        
        <div class="icon-item">
          <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span class="icon-label">点赞</span>
        </div>
        
        <div class="icon-item">
          <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span class="icon-label">收藏</span>
        </div>
        
        <div class="icon-item">
          <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span class="icon-label">浏览</span>
        </div>
      </div>
    </section>
    
    <!-- 联系方式图标 -->
    <section class="demo-section">
      <h2>联系方式图标（Contact Icons）</h2>
      <div class="icon-grid">
        <div class="icon-item">
          <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
          <span class="icon-label">电话</span>
        </div>
        
        <div class="icon-item">
          <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <span class="icon-label">邮箱</span>
        </div>
        
        <div class="icon-item">
          <svg class="demo-icon qq-icon" viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M512 188.384c194.752 0 204.64 173.984 215.36 208.256 0 0 15.36 17.12 19.008 43.232 2.368 16.864-7.232 36-7.232 36s62.24 83.872 62.24 149.76c0 41.12-12.128 62.368-26.24 62.368-14.272 0-35.008-43.52-35.008-43.52s-32.512 69.408-48.768 79.392c-16.224 9.888 58.624 20.768 58.624 53.12 0 32.512-59.488 46.88-108.096 46.88-48.768 0-126.272-25.248-126.272-25.248l-28-0.864s-21.6 30.624-110.88 30.624c-89.248 0-128-24.256-128-53.12 0-38.88 56.896-44.16 56.896-44.16s-36.256-10.112-66.88-95.84c0 0-21.248 46.24-51.264 46.24 0 0-12.608-7.52-12.608-49.6 0-87.168 62.624-129.664 89.6-155.776 0 0-4.48-11.392-2.112-25.504 2.624-15.744 12-25.248 12-25.248s-3.52-18.88 9.632-34.112c2.624-42.4 33.28-202.88 228-202.88m0-64c-204.736 0-277.376 146.88-290.24 245.376-6.144 12-9.632 24.352-11.008 36a112.64 112.64 0 0 0-12.768 44.256c-35.488 32.608-87.104 88.224-87.104 181.856 0 64.992 23.872 92.768 44 104.64l15.008 8.96H189.12c-2.88 9.152-4.384 19.04-4.384 29.76 0 27.52 13.888 117.28 192 117.28 65.28 0 106.016-14.144 131.008-29.248 26.24 7.872 87.616 24.64 134.016 24.64 104.64 0 172.256-43.52 172.256-110.912 0-12-2.4-22.624-6.272-32.128 30.88-13.984 57.504-50.112 57.504-119.232 0-60.64-33.504-124.256-56.256-160.512 1.76-10.368 2.368-21.984 0.768-33.984a154.56 154.56 0 0 0-23.136-61.632l-0.736-3.744C752.384 205.504 660.128 124.384 512 124.384z"></path>
          </svg>
          <span class="icon-label">QQ</span>
        </div>
        
        <div class="icon-item">
          <svg class="demo-icon wechat-icon" viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M767.818667 409.173333C867.338667 444.266667 938.666667 539.136 938.666667 650.666667c0 42.709333-10.496 83.978667-30.261334 120.842666-1.792 3.338667-4.992 8.928-9.696 16.96l14.613334 53.557334c6.506667 23.893333-15.402667 45.813333-39.296 39.296l-53.642667-14.634667-6.229333 3.669333A254.933333 254.933333 0 0 1 682.666667 906.666667c-77.994667 0-147.84-34.88-194.805334-89.888a352.608 352.608 0 0 1-56.64 4.554666c-63.338667 0-124.266667-16.853333-177.472-48.298666-1.834667-1.088-6.410667-3.733333-13.632-7.893334l-80.544 21.653334c-23.914667 6.432-45.76-15.573333-39.146666-39.434667l21.792-78.752a961.205333 961.205333 0 0 1-15.904-27.317333A336.384 336.384 0 0 1 85.333333 480c0-188.618667 154.965333-341.333333 345.888-341.333333 159.914667 0 297.984 108.010667 335.818667 259.296 0.949333 3.765333 1.173333 7.552 0.778667 11.2z m-68.106667-13.952C662.88 282.037333 555.178667 202.666667 431.221333 202.666667 275.434667 202.666667 149.333333 326.933333 149.333333 480c0 46.272 11.498667 90.837333 33.194667 130.698667 2.88 5.290667 10.176 17.706667 21.621333 36.746666a32 32 0 0 1 3.413334 25.013334l-10.517334 37.994666 39.232-10.549333a32 32 0 0 1 24.234667 3.146667c14.272 8.192 22.773333 13.098667 25.802667 14.890666A283.882667 283.882667 0 0 0 431.221333 757.333333c6.154667 0 12.288-0.192 18.389334-0.576A255.061333 255.061333 0 0 1 426.666667 650.666667c0-141.386667 114.613333-256 256-256 5.728 0 11.413333 0.192 17.045333 0.554666z m133.706667 397.056a32 32 0 0 1 3.338666-24.725333 996.672 996.672 0 0 0 15.242667-26.293333A190.997333 190.997333 0 0 0 874.666667 650.666667c0-106.037333-85.962667-192-192-192s-192 85.962667-192 192 85.962667 192 192 192a190.933333 190.933333 0 0 0 98.570666-27.2c2.208-1.322667 8.288-4.874667 18.517334-10.837334a32 32 0 0 1 24.522666-3.210666l12.565334 3.424-3.424-12.565334zM330.666667 426.666667a42.666667 42.666667 0 1 1 0-85.333334 42.666667 42.666667 0 0 1 0 85.333334z m192 0a42.666667 42.666667 0 1 1 0-85.333334 42.666667 42.666667 0 0 1 0 85.333334z m85.333333 202.666666a32 32 0 1 1 0-64 32 32 0 0 1 0 64z m149.333333 0a32 32 0 1 1 0-64 32 32 0 0 1 0 64z"></path>
          </svg>
          <span class="icon-label">微信</span>
        </div>
        
        <div class="icon-item">
          <svg class="demo-icon bilibili-icon" viewBox="0 0 1024 1024" fill="currentColor">
            <path d="M777.514667 131.669333a53.333333 53.333333 0 0 1 0 75.434667L728.746667 255.829333h49.92A160 160 0 0 1 938.666667 415.872v320a160 160 0 0 1-160 160H245.333333A160 160 0 0 1 85.333333 735.872v-320a160 160 0 0 1 160-160h49.749334L246.4 207.146667a53.333333 53.333333 0 1 1 75.392-75.434667l113.152 113.152c3.370667 3.370667 6.186667 7.04 8.448 10.965333h137.088c2.261333-3.925333 5.12-7.68 8.490667-11.008l113.109333-113.152a53.333333 53.333333 0 0 1 75.434667 0z m1.152 231.253334H245.333333a53.333333 53.333333 0 0 0-53.205333 49.365333l-0.128 4.010667v320c0 28.117333 21.76 51.157333 49.365333 53.162666l3.968 0.170667h533.333334a53.333333 53.333333 0 0 0 53.205333-49.365333l0.128-3.968v-320c0-29.44-23.893333-53.333333-53.333333-53.333334z m-426.666667 106.666666c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z m320 0c29.44 0 53.333333 23.893333 53.333333 53.333334v53.333333a53.333333 53.333333 0 1 1-106.666666 0v-53.333333c0-29.44 23.893333-53.333333 53.333333-53.333334z"></path>
          </svg>
          <span class="icon-label">Bilibili</span>
        </div>
      </div>
    </section>
    
    <!-- 功能图标 -->
    <section class="demo-section">
      <h2>功能图标（Functional Icons）</h2>
      <div class="icon-grid">
        <div class="icon-item">
          <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
          <span class="icon-label">展开箭头</span>
        </div>
        
        <div class="icon-item">
          <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span class="icon-label">复制</span>
        </div>
        
        <div class="icon-item">
          <svg class="demo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span class="icon-label">首页</span>
        </div>
      </div>
    </section>
    
    <!-- 代码示例 -->
    <section class="demo-section">
      <h2>使用示例</h2>
      <div class="code-block">
        <pre><code>&lt;!-- 在 Vue 模板中使用图标 --&gt;
&lt;svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"&gt;
  &lt;path d="..."&gt;&lt;/path&gt;
&lt;/svg&gt;

&lt;style scoped&gt;
.icon {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.7);
}
&lt;/style&gt;</code></pre>
      </div>
    </section>
  </div>
</template>

<style scoped>
.icon-demo {
  padding: 40px;
  max-width: 1000px;
  margin: 0 auto;
  color: #ffffff;
}

h1 {
  font-size: 32px;
  margin-bottom: 40px;
  text-align: center;
  color: #ffffff;
}

h2 {
  font-size: 24px;
  margin: 30px 0 20px;
  color: #e0e0e0;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}

.demo-section {
  margin-bottom: 40px;
  background-color: #1a1a1a;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #333;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.icon-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.demo-icon {
  width: 32px;
  height: 32px;
  color: rgba(255, 255, 255, 0.9);
}

/* 微信图标特殊样式 */
.demo-icon.wechat-icon {
  width: 36px;
  height: 36px;
}

/* Bilibili图标特殊样式 */
.demo-icon.bilibili-icon {
  width: 36px;
  height: 36px;
}

/* QQ图标特殊样式 */
.demo-icon.qq-icon {
  width: 36px;
  height: 36px;
}

.icon-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.code-block {
  background-color: #0c0c0c;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid #333;
}

.code-block pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #cccccc;
}

@media (max-width: 768px) {
  .icon-demo {
    padding: 20px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  h2 {
    font-size: 20px;
  }
  
  .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
  
  .demo-icon {
    width: 28px;
    height: 28px;
  }
}
</style>
