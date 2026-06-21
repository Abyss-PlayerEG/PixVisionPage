<template>
  <div class="ap-page" ref="pageRef">

    <!-- ══════════════════════════════════════════════
         Top Sticky Bar — 毛玻璃横条
         ══════════════════════════════════════════════ -->
    <div class="ap-topbar">
      <!-- 品牌文字（无药丸底，3片SVG叶同原版） -->
      <div class="ap-brand" aria-label="Pixel Vision">
        <svg t="1779498952979" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3588" width="16" height="16"><path d="M427.20768 958.73536s137.42592-16.76288 194.80576-106.79808c18.49856-29.02016 39.61856-43.69408 60.33408-44.68736 58.33216-2.80576 35.24096 55.38304 40.29952 62.27968 4.29056 5.85216 13.93664 2.56 34.0992 6.22592 23.04 4.20352 34.33984 46.592-0.83968 73.25184-41.05728 31.09888-168.56064 99.44064-328.69888 9.728z" fill="#B8D390"/><path d="M127.4368 651.5456s-11.776-76.43648 86.79936-105.8816c20.40832 29.61408 16.6144 75.776 3.0976 108.99456-9.56928 23.552-26.16832 37.376-34.0992 40.48384-14.66368 6.26176-1.536 12.68736 15.49824 9.33888a196.44416 196.44416 0 0 0 65.1008-31.13984c16.85504-9.728 16.75264 17.12128 12.40064 37.376s-39.66976 60.53376-102.30272 40.48384c0 0-16.70144-6.25664-6.20032 9.33888s21.87776 60.35456-55.808 65.39776c0 0 4.31616-21.03808-27.89888-52.9408s1.88928-59.904 18.60096-52.9408c0 0 5.24288 1.29536 0-6.22592-4.33152-6.18496-48.04608-0.41984-71.30112-18.68288-14.25408-11.19744-23.41376-38.2208-24.10496-45.68064-3.83488-41.5488 17.88928-13.48096 17.92-13.48608s37.15584 26.91072 49.60256 28.02688 7.72608-2.87232 3.0976-6.23104S0.55296 610.92864 22.016 530.09408c96.96256-6.28736 99.2 112.128 99.2 112.128s3.62496 19.34336 6.2208 9.32352z" fill="#77B26B"/><path d="M332.03712 424.2176s67.00544 73.50272 55.808 143.24736c-8.96512 55.7824-64.6912 57.344-80.59904 68.51072-10.80832 7.59808-34.27328-39.59808-27.68896-92.16a126.83776 126.83776 0 0 1 33.88928-72.86272s3.93216-4.02432 6.20032 3.11296a275.36896 275.36896 0 0 1 6.20032 37.376c0.58368 3.98848 2.2016 13.51168 6.20032 15.56992 2.34496 0.2304 6.39488-6.74304 6.20032-12.45696-0.13824-4.096-0.768-21.66784-3.10272-40.48384-3.18976-25.69728-7.85408-53.4016-3.10784-49.85344z" fill="#6D8638"/><path d="M139.83744 277.85728s16.77824-59.74528 68.1984-40.48384c36.41344 13.62432 25.05216 57.344 24.80128 71.62368 0 0 74.6752-17.408 77.50144 49.82784 1.49504 35.60448-42.23488 57.61536-58.88 59.16672s35.00032 23.6288 3.0976 68.51072C215.43424 508.35968 195.584 479.62112 189.44 480.256c-7.74144 0.81408-28.672 47.78496-74.39872 28.02688-18.82624-9.216-25.7024-33.31584-21.69856-49.82784S30.96576 478.44864 18.944 408.64768c-4.352-37.888 24.89344-56.4224 40.29952-52.9408s-45.32736-40.64256-3.0976-87.1936c11.264-12.39552 28.672-13.0304 40.29952-12.45696 25.46688 1.2544 42.15808 21.18144 43.392 21.80096z m18.60096 71.62368a24.91392 24.91392 0 1 1-24.8064 24.9088 24.8576 24.8576 0 0 1 24.8064-24.9088z" fill="#F2B9E4"/><path d="M353.7408 72.32512s73.89184 80.62464-65.1008 105.8816c-129.15712 23.47008-86.79936-37.376-86.79936-37.376S274.432 15.67232 353.7408 72.32512z" fill="#77B960"/><path d="M564.54144 838.38976s-36.4288 0.44032-99.2 40.48384c-20.23936 12.91264-47.75936 14.60224-61.99808 15.56992-23.18336 1.55648-24.97536-3.56352-37.20704 12.45696a100.2496 100.2496 0 0 1-18.60096 21.79584 7.68 7.68 0 0 1-9.2928-2.4064c-2.82624-4.33664 1.2032-7.72096 6.99904-14.09024 8.00256-8.79104 16.10752-17.6128 11.59168-17.75616-15.0016-0.48128-22.59968-1.41312-24.80128 0-8.50432 5.4528-74.61888 42.33216-120.90368-6.23104-4.51072-10.89536 2.56-10.66496 6.20032-9.33888 0 0 40.28928 43.8784 102.30272 9.33888a60.48256 60.48256 0 0 1-21.69856-43.5968l3.0976-21.79584s14.19776-14.25408 12.40064 6.22592c-1.39776 15.872-3.24608 28.672 9.05728 40.76032a50.3808 50.3808 0 0 0 28.16 12.18048s28.34944 0.64 40.29952 0c3.4816-0.18944 0.70144-2.00704-3.0976-12.45696a18.07872 18.07872 0 0 1 0-12.45696c2.048-9.344 9.29792 0 9.29792 0s-1.024 0.85504 3.0976 12.45696a18.6368 18.6368 0 0 0 9.30304 12.45696 34.9952 34.9952 0 0 0 10.19904 1.34144c31.98976 0.09216 105.472-59.29984 147.90144-51.16928z m-147.13856 2.21696q0 32.96256-20.53632 6.96832-31.08352 9.64608-13.25056-17.664-19.21024-26.99776 12.34944-17.87904 19.21024-26.33216 20.87936 6.60992 31.08352 10.71616 0.55808 21.9648z m-110.87872-32.08192q-38.03648 22.24128-22.35904-19.06688-32.81408-29.4656 11.14112-27.25888 17.75616-40.448 29.24544 2.2272 43.78624 4.46464 6.93248 28.63104 9.30816 43.20768-24.96512 15.46752z m-103.87968 66.01216q-1.73568 30.83776-19.67616 5.74976-29.73184 7.86944-11.52512-17.01888-16.64-25.97376 12.55424-16.27136 19.456-23.92576 19.28704 6.9632 28.65152 11.19232-0.64 20.57728z m109.62432 55.02976q15.50848-28.672 21.57568 3.73248 32.256 6.42048 3.49696 21.68832 4.41856 32.6656-19.41504 9.68192-29.50656 13.76256-15.49312-15.71328-22.656-24.15104 9.83552-19.38944z" fill="#6EC597"/><path d="M425.0368 629.76s-10.59328-106.23488 86.79936-102.76352c78.81216 2.80576 71.30112 112.128 71.30112 112.128s86.47168 37.376 37.1968 112.128c-47.2064 71.6032-127.09888 12.45696-127.09888 12.45696s-84.48 54.3232-120.90368-15.57504C328.26368 663.4752 425.0368 629.76 425.0368 629.76z m56.14592 10.51648s8.4224 34.816 20.34176 33.92512c10.58304-0.80896 17.24928-29.35296 17.24928-29.35296s10.33728-25.00096 22.11328-2.56c13.34272 25.43104 0.3584 66.99008-42.11712 65.3568-41.05728-1.58208-49.85856-45.95712-37.74976-65.536s20.16768-1.84832 20.16768-1.84832z" fill="#D8B9F2"/><path d="M918.40512 444.22656c-25.48224 1.8688-9.5488 5.84192-9.5488 5.84192 36.95616-2.2784 96.93184 30.7712 76.04736 37.376-29.44512 9.344-85.0176-19.11296-89.088-22.3488s-17.92-7.97184-12.51328 2.60608c8.63744 16.896 24.15616 25.14944 69.85216 37.1456s20.54656 28.89216 20.54656 28.89216c-36.8384 17.48992-60.48768-6.37952-70.48704-21.58592s-47.93856-55.69024-50.73408-48.7936 6.784 53.67296 40.70912 67.11808c51.8144 20.52608 36.16256 26.41408 36.16256 26.41408-39.936 13.57312-62.976 4.608-76.1088-11.9296-21.92384-27.53536-25.67168-79.50848-25.67168-79.50848-63.17056-26.5216-99.72736 26.53184-104.92416 33.51552-5.24288 9.6512-12.55424 45.2096-26.49088 63.616-13.17376 17.408-25.6 24.76544-54.10816 29.80864-17.08032 3.01568-42.60864-12.76928-42.54208-37.12 0.05632-22.8096 16.85504-33.47968 26.7776-33.55648s25.45152 5.38112 23.7568 16.02048c-1.42848 8.96512-7.99232 11.21792-12.19584 9.856s-12.16512-7.06048-17.50016-1.91488c-6.4512 6.23104-3.10784 19.60448 6.20032 24.91392 5.89312 3.36384 28.54912 3.0976 44.96384-12.19072 8.87808-8.2688 14.23872-28.99456 17.09056-36.66432s10.04544-45.7728 43.20256-66.43712c62.0032-38.64064 106.3424-19.90144 131.072-37.75488 44.11392-31.82592 5.1968-109.38368 5.1968-109.38368a6.85568 6.85568 0 0 1 0.25088-6.2208c1.11104-1.152 3.28192-1.41824 12.3904 0.512 26.26048 5.5552 42.17344 27.76064 47.2832 50.06336 4.28544 18.70848 1.96608 37.80096-4.736 48.29696-12.8 20.05504-7.808 16.384 2.71872 9.46176s72.49408-55.05536 91.2128-30.54592c20.34688 26.5984-73.30304 62.63808-98.78528 64.49664z" fill="#66DBAC"/><path d="M771.47136 247.6288c-5.71904 11.1616-4.54144 20.83328 5.248 29.24544 5.86752 5.04832 10.94144 10.99776 16.60928 16.2816 40.36608 43.43296 36.82304 47.7952 37.82144 65.9968-4.608 16.01536-17.36192 23.88992-30.99136 30.27968-30.06464 14.10048-60.8512 25.64608-94.976 23.10656a18.944 18.944 0 0 0-20.8384 14.81216c-4.35712 13.312-8.93952 26.54208-14.39744 39.424-11.99104 28.34432-34.9696 35.27168-60.96896 18.176a235.89376 235.89376 0 0 1-26.69568-21.15584c-10.47552-9.30304-21.43232-10.15808-32.19456-1.48992-34.19136 27.55072-74.7264 30.68928-115.90656 30.64832-18.2272 0-24.88832-6.85568-24.86272-25.5488a305.72544 305.72544 0 0 1 8.192-72.43776c4.6848-19.16416 2.65216-24.31488-14.7968-34.05824-38.49216-21.504-69.28896-51.712-97.19296-85.41184-13.60896-16.43008-16.896-43.60192 8.31488-59.11552 31.25248-19.26144 62.65856-37.9392 98.01216-48.71168 17.25952-5.25824 20.78208-10.33216 21.59104-29.01504 2.9696-68.63872 25.21088-101.40672 43.37664-116.608a47.2576 47.2576 0 0 1 18.51392-11.136 46.592 46.592 0 0 1 22.35904 1.77664c22.528 5.59616 54.69184 23.2448 99.4048 66.07872 13.2352 12.67712 24.69888 17.76128 42.3936 11.83232 99.37408-33.31072 137.9072-8.13056 140.46208-4.70528-15.57504-20.85888 35.0208 14.336-21.68832 147.75808-2.0224 4.7616-4.4288 9.3696-6.78912 13.9776z m-154.79808-4.608c-34.0736-25.6-71.52128-14.75072-85.56544 25.49248-17.59744 50.41152-2.71872 101.16096 51.87584 129.3312a6.656 6.656 0 0 0 7.13216 1.23904c3.4304-2.49856 0.95744-5.59616-0.14848-8.32-5.66784-13.98272-12.33408-61.63968-7.04512-75.06944 3.87584-9.8304 8.99584-12.96384 18.432-6.04672 11.88352 8.73472 31.744 52.49024 34.90304 67.84512 0.512 2.39104-0.20992 5.59616 3.2768 6.144a5.5552 5.5552 0 0 0 5.5808-4.35712 144.21504 144.21504 0 0 0 16.19456-55.63392 106.7264 106.7264 0 0 0-44.63616-80.60416z" fill="#FF9D6C"/><path d="M796.54912 679.86432C675.84 601.088 696.10496 606.8224 696.10496 606.8224s28.76928-39.73632 77.75744-47.98464c34.3808-5.79072 60.672 4.8384 130.0224 50.688 22.35904 14.78144 62.77632 45.65504 62.77632 45.65504s-49.41312 103.45472-170.112 24.68352z m45.33248 90.35776c8.66304 48.91136-18.78528 89.27232-18.78528 89.27232s12.10368 17.17248-101.64736-70.29248-33.792-168.52992-33.792-168.52992 42.28096 27.79136 63.52896 43.93472c65.92 50.05312 84.61312 71.28576 90.69568 105.61536z m44.57472-27.136q42.78784-32.10752 20.992 16.86528 33.87904 43.85792-16.14848 20.27008-42.78272 32.11776-20.992-16.86016-33.88416-43.8528 16.14848-20.26496z" fill="#6EC597"/></svg>
        <span class="ap-brand--text">Pixel - Vision</span>
      </div>

      <!-- 返回按钮 -->
      <button class="ap-back-btn" @click="goBack" aria-label="返回">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
      </button>

      <!-- Tab 胶囊 -->
      <div class="ap-tab-capsule" ref="capsuleRef">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="ap-tab-item"
          :class="{ 'ap-tab-item--active': activeTab === tab.key }"
          @click="handleTabClick(tab.key)"
        >{{ tab.label }}</div>
        <div class="ap-tab-slider" :style="sliderStyle"></div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         Content — 三个面板
         ══════════════════════════════════════════════ -->
    <div class="ap-content">
      <div class="ap-panels-wrap">
        <!-- Panel 1: 关于我们 -->
        <div class="ap-panel ap-about" :class="{ 'ap-panel--on': activeTab === 'about' }" ref="aboutPanel">
          <div class="ap-about--layout">
            <div class="ap-about--text">
              <h2 class="ap-about--title">像素是起点，<br>不是限制。</h2>
              <p class="ap-about--subtitle">Every frame is a universe built from dots.</p>
              <div class="ap-about--body">
                <p>我们叫「第三维度」——<br>不是因为技术上的 3D，而是相信在二维屏幕之外，<br>好的作品能打开第三层空间：<br>想象力。</p>
                <p>「像素视觉」是这个信念的容器。<br>它不只是一张图片、一个网页，<br>它是每一个创作者按下快门、点击上传时，<br>让像素从数据变成表达的瞬间。</p>
                <p>我们年轻。<br>但不是"还没长大"的那种年轻——<br>是敢把热爱做成产品、敢让设计说话、<br>敢在一个满是算法的时代，<br>把"好看"当成信仰。</p>
                <p>这里没有大厂的规格，没有资本的剧本。<br>像素视觉由几个想做出好东西的人，<br>一点一点搭起来。<br>你看到的每处动画、每个界面转角，<br>都是我们凌晨三点还在争论的结果。</p>
                <p>欢迎你来。<br>看作品，也看我们怎么把这件事做下去。</p>
              </div>
            </div>

            <!-- 深度交错图片 — 绝对定位在 layout 容器内，可溢出覆盖文字 -->
            <img class="ap-about--img ap-about--img1" :src="meixueImg" alt="美学" loading="lazy" />
            <img class="ap-about--img ap-about--img2" :src="breadImg" alt="面包" loading="lazy" />
            <img class="ap-about--img ap-about--img3" :src="broImg" alt="bro" loading="lazy" />
          </div>
        </div>

        <!-- Panel 2: 创作条例 -->
        <div class="ap-panel ap-guide" :class="{ 'ap-panel--on': activeTab === 'guide' }" ref="guidePanel">
          <div class="ap-guide--inner">
            <p class="ap-guide--quote">规则不是为了束缚你，是为了让更多人愿意留在这里。</p>
            <p class="ap-guide--preamble">以下规范适用于所有创作者。当你点击"申请成为创作者"时，意味着你已经读过并愿意遵守这份约定。如果你还不是创作者，这些内容同样是你了解这个社区的一扇窗。</p>

            <div class="ap-guide--rules">
              <div class="ap-guide--rule" v-for="rule in guideRules" :key="rule.num">
                <p class="ap-guide--rule-num">{{ rule.num }}</p>
                <p class="ap-guide--rule-title">{{ rule.title }}</p>
                <p class="ap-guide--rule-body" v-for="(para, i) in rule.body" :key="i">{{ para }}</p>
              </div>
            </div>

            <p class="ap-guide--closing">这份条例不算长，但它是像素视觉创作者之间沉默的共识申请成为创作者时你点下的那个同意，不是一纸空文，它是我们选择在一个更干净的社区里做事的证明。如果你读到了这里，谢谢你的耐心。接下来的事，交给行动。</p>
          </div>
        </div>

        <!-- Panel 3: 订阅 -->
        <div class="ap-panel ap-subscribe" :class="{ 'ap-panel--on': activeTab === 'subscribe' }" ref="subscribePanel">
          <!-- 文案子面板 -->
          <template v-if="subscribeView === 'copy'">
            <div class="ap-subscribe--inner">
              <p class="ap-subscribe--quote">像素视觉会一直存在。<br>但有了你，它能走得更快、做得更好。</p>
              <div class="ap-subscribe--body">
                <p>像素视觉没有广告，不卖数据。你看到的每一个界面、每一处动画、每一个功能都是用时间换来的。创作者们的热情让这个平台活着，但服务器不会因为热情就免单。</p>
                <p>订阅不是"付费解锁"。它是一种直接的支持——你认可我们做的事，于是用一杯咖啡的钱，让服务器多跑一个月，让深夜改 bug 的人能继续专注地改下去。我们不会因为你不订阅而限制你——现阶段，每个功能对所有人开放。</p>
              </div>

              <ul class="ap-subscribe--benefits">
                <li class="ap-subscribe--benefit-item">
                  <span class="ap-subscribe--benefit-dot"></span>
                  一枚支持者徽章，显示在你的头像旁（开发中）
                </li>
                <li class="ap-subscribe--benefit-item">
                  <span class="ap-subscribe--benefit-dot"></span>
                  你的名字出现在支持者名单中
                </li>
                <li class="ap-subscribe--benefit-item">
                  <span class="ap-subscribe--benefit-dot"></span>
                  专属个人主页装扮
                </li>
                <li class="ap-subscribe--benefit-item">
                  <span class="ap-subscribe--benefit-dot"></span>
                  优先体验新功能
                </li>
                <li class="ap-subscribe--benefit-item">
                  <span class="ap-subscribe--benefit-dot"></span>
                  加入内测组，直接参与产品决策
                </li>
              </ul>

              <div class="ap-subscribe--input-row">
                <input
                  class="ap-subscribe--input"
                  type="email"
                  placeholder="留下你的邮箱"
                  v-model="emailInput"
                />
                <button class="ap-subscribe--submit" @click="handleSubscribeSubmit">加入等待名单</button>
              </div>
            </div>
          </template>

          <!-- 支持者名单子面板 -->
          <template v-else>
            <div class="ap-subscribe--supporters">
              <p class="ap-subscribe--empty">暂无</p>
            </div>
          </template>

          <!-- 切换按钮 -->
          <button class="ap-subscribe--toggle" @click="toggleSubscribeView">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline v-if="subscribeView === 'copy'" points="17 1 21 5 17 9"/>
              <polyline v-else points="7 1 3 5 7 9"/>
              <path d="M3 5h12"/>
              <path v-if="subscribeView === 'copy'" d="M7 23H3v-4"/>
              <path v-else d="M17 23h4v-4"/>
            </svg>
            {{ subscribeView === 'copy' ? '查看支持者名单' : '返回订阅介绍' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import gsap from 'gsap'

// 图片（Vite 静态资源）
import meixueImg from '@/assets/IMG/美学.jpg'
import breadImg from '@/assets/IMG/面包.jpg'
import broImg from '@/assets/IMG/bro.jpg'

const router = useRouter()
const route = useRoute()

// ── Refs ──
const pageRef = ref(null)
const capsuleRef = ref(null)
const aboutPanel = ref(null)
const guidePanel = ref(null)
const subscribePanel = ref(null)

let ctx = null
let guideTl = null
let pageshowHandler = null

// ── State ──
const tabs = [
  { key: 'about', label: '关于我们' },
  { key: 'guide', label: '创作条例' },
  { key: 'subscribe', label: '订阅' },
]
const activeTab = ref('about')
const subscribeView = ref('copy')
const isAnimating = ref(false)
const emailInput = ref('')

// ── 创作条例内容 ──
const guideRules = [
  {
    num: '一',
    title: '原创是底线',
    body: [
      '你上传的每一张作品，都应该是你自己创作的。我们不要求专业水准，但要求诚实。',
      '不盗图——不以任何形式将他人的摄影、绘画、设计作品署上自己的名字。不搬运——不从其他平台下载后原样上传，哪怕你觉得"只是分享一下"。灵感可以借鉴，但像素不能打开别人的文件保存为自己的成果。',
      '如果作品是合作创作，请在描述中注明合作者。给他人应有的署名，是对创作本身的敬畏。',
    ],
  },
  {
    num: '二',
    title: '你对你的作品拥有权利，也承担责任',
    body: [
      '你拥有你作品的版权，这一点不会因为你上传到像素视觉而改变。我们不是版权代理方，不上传即失去权利。',
      '但同样的——如果作品里出现了他人的肖像、私人空间、或涉及他人权益的内容，请确保你获得了许可。平台不是挡箭牌。一旦产生纠纷，你需要自己面对和解决。',
    ],
  },
  {
    num: '三',
    title: '审核审的是边界，不是审美',
    body: [
      '审核团队不会因为"拍得不好"或"风格太小众"拒绝你的作品。可能有人觉得你的作品不够好——那是评论区的职责，不是审核的职责。',
      '审核只看一件事：有没有越过底线。违规内容、侵权内容、违法违规内容——这些是我们的关注范围。至于一张照片好不好看，交给社区去判断。',
    ],
  },
  {
    num: '四',
    title: '违规的代价是真实的',
    body: [
      '作品违规会被下架。屡次违规（累计达到一定次数），或单次严重违规，可能导致创作者资格被取消。',
      '什么是"严重"？我们没有写穷举清单——我们选择把信任先交给你。但如果你存心想测试底线的位置，我们会用行动告诉你它在哪里。规则写得再厚，不如一次公正的执行。',
    ],
  },
  {
    num: '五',
    title: '社区是所有人的客厅',
    body: [
      '评论区的善意，和作品区的质量同样重要。',
      '你可以提出不同的看法——争辩是可以的，攻击不行。你可以指出作品的不足——批评是可以的，羞辱不行。我们希望每个点进评论区的人，感受到的是讨论的氛围，而不是战场的气息。你在这里留下的每一个字，都在塑造这个空间的模样。',
    ],
  },
  {
    num: '六',
    title: '规范在成长，保持透明',
    body: [
      '平台在变，规则也会跟着变。重大的修改我们会公开说明，不会悄悄改了让你自己去发现。如果你对规则有任何疑问，可以通过站内方式联系我们——这不是一句客套，是认真的。我们没法一一回复所有人，但每一条意见都会被记录和讨论。',
    ],
  },
]

// ── Slider style ──
const sliderStyle = computed(() => {
  const idx = tabs.findIndex(t => t.key === activeTab.value)
  const pct = 100 / tabs.length
  return {
    left: `${idx * pct}%`,
    width: `${pct}%`,
  }
})

// ── Methods ──
function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function handleTabClick(targetKey) {
  if (isAnimating.value || targetKey === activeTab.value) return
  isAnimating.value = true

  const fromKey = activeTab.value

  // 清除 guide stagger
  if (guideTl) { guideTl.kill(); guideTl = null }
  gsap.set('.ap-guide--quote, .ap-guide--rule, .ap-guide--closing', { clearProps: 'all' })

  // 滑块立即更新
  activeTab.value = targetKey

  // 旧面板用 GSAP 淡出（它仍是 position:relative，撑住高度）
  const fromEl = { about: aboutPanel, guide: guidePanel, subscribe: subscribePanel }[fromKey]
  const toEl = { about: aboutPanel, guide: guidePanel, subscribe: subscribePanel }[targetKey]

  // 目标面板先 absolute + opacity:0 叠在旧面板上方
  gsap.set(toEl.value, { position: 'absolute', top: 0, left: 0, width: '100%', opacity: 0 })

  const tl = gsap.timeline({
    onComplete: () => {
      // 旧面板切为 absolute 隐藏，新面板切为 relative（撑高度）
      gsap.set(fromEl.value, { position: 'absolute', opacity: 0, pointerEvents: 'none', clearProps: 'top,left,width' })
      gsap.set(toEl.value, { position: 'relative', opacity: 1, pointerEvents: 'auto', clearProps: 'top,left,width' })
      isAnimating.value = false
      pageRef.value.scrollTop = 0
      if (targetKey === 'guide') triggerGuideEntrance()
    },
  })

  tl.to(fromEl.value, { opacity: 0, duration: 0.25, ease: 'power2.out' }, 0)
    .to(toEl.value, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0)
}

function triggerGuideEntrance() {
  guideTl = gsap.timeline({
    onComplete: () => { guideTl = null },
  })

  guideTl
    .from('.ap-guide--quote', {
      y: 20, opacity: 0, duration: 0.4, ease: 'power2.out',
    })
    .from('.ap-guide--rule', {
      y: 20, opacity: 0, duration: 0.35,
      stagger: { each: 0.12 },
      ease: 'power2.out',
    })
    .from('.ap-guide--closing', {
      y: 20, opacity: 0, duration: 0.4, ease: 'power2.out',
    }, '-=0.1')
}

function toggleSubscribeView() {
  subscribeView.value = subscribeView.value === 'copy' ? 'supporters' : 'copy'
}

function handleSubscribeSubmit() {
  // 占位：后续接入 API
  if (!emailInput.value.trim()) return
  console.log('Subscribe email:', emailInput.value)
  emailInput.value = ''
}

function resolveHash(hash) {
  const map = {
    '#about': 'about',
    '#guide': 'guide',
    '#subscribe': 'subscribe',
  }
  return map[hash] || 'about'
}

// ── Lifecycle ──
onMounted(() => {
  const initialTab = resolveHash(route.hash)
  activeTab.value = initialTab

  // 初始面板：活跃的相对定位，其余 absolute 隐藏
  const panelMap = {
    about: aboutPanel.value,
    guide: guidePanel.value,
    subscribe: subscribePanel.value,
  }
  Object.entries(panelMap).forEach(([key, el]) => {
    if (!el) return
    if (key === initialTab) {
      gsap.set(el, { position: 'relative', opacity: 1, pointerEvents: 'auto' })
    } else {
      gsap.set(el, { position: 'absolute', top: 0, left: 0, width: '100%', opacity: 0, pointerEvents: 'none' })
    }
  })

  // 创建 GSAP context（作用域绑定）
  ctx = gsap.context(() => {
    // 不自动运行动画；context 用于选selector 作用域
  }, pageRef.value)

  // BFCache 修复
  pageshowHandler = (event) => {
    if (event.persisted) {
      requestAnimationFrame(() => {
        if (pageRef.value) {
          pageRef.value.style.display = 'none'
          void pageRef.value.offsetHeight
          pageRef.value.style.display = ''
        }
      })
    }
  }
  window.addEventListener('pageshow', pageshowHandler)
})

onUnmounted(() => {
  if (ctx) ctx.revert()
  if (guideTl) guideTl.kill()
  if (pageshowHandler) {
    window.removeEventListener('pageshow', pageshowHandler)
  }
})
</script>

<style>
@import url(../assets/CSS/aboutPixel.css);
</style>
