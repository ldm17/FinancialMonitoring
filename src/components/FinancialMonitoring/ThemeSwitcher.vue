<template>
  <el-switch 
    style="--el-switch-on-color: #888; --el-switch-off-color: #888" 
    v-model="isDark" 
    inline-prompt
    :active-icon="Icons.Moon" 
    :inactive-icon="Icons.Sunny" 
    @change="toggleTheme" />
</template>

<script>
import * as Icons from '@element-plus/icons-vue';
import { useDark, useToggle } from '@vueuse/core'

export default {
  name: 'theme-switcher',
  created() {
    this.darkMode = useDark({ storageKey: 'theme' })
    this.toggleDark = useToggle(this.darkMode)
  },
  data() {
    return {
      isDark: useDark({ storageKey: 'theme' }).value,
      Icons,
    }
  },
  methods: {
    toggleTheme() {
      this.toggleDark()
    }
  }
}
</script>