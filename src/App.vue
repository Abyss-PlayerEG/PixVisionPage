<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <RouterView/>
</template>

<style>
/* 全局样式配置 */
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,body{
  background-color: #1a1a1a;
}

/* 全局滚动条样式 */
/* Webkit浏览器（Chrome, Safari, Edge等） */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #242424;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #505050; 
  border-radius: 4px;
  transition: background 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #777777; 
}

::-webkit-scrollbar-corner {
  background: #242424;
}

/* Firefox浏览器 */
* {
  scrollbar-width: thin;
  scrollbar-color: #505050 #242424;
}
</style>
