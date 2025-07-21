<template>
  <div class="authentication-page">
    <el-card>
      <label class="authentication-title">Авторизация</label>

      <div class="segmented-container">
        <el-segmented v-model="selectedAuthType" :options="['Авторизация', 'Регистрация']" @change="this.$router.push({ name: 'register' })" style="width: 250px" />
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" hide-required-asterisk @submit.prevent="handleLogin">
        <el-form-item label="Email" prop="email" label-position="top">
          <el-input style="width: 250px;" v-model="form.email" type="email" placeholder="Введите ваш email" clearable required />
        </el-form-item>
        <el-form-item label="Пароль" prop="password" label-position="top" style="margin-top: 10px;">
          <el-input style="width: 250px;" v-model="form.password" type="password" placeholder="Введите ваш пароль" clearable required />
        </el-form-item>
        <el-button class="authentication-submit-button" type="primary" native-type="submit" :loading="isLoading">Продолжить</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { useAuthenticationStore } from '@/stores/AuthenticationStore';
import ApiClient from '@/api/ApiClient';
import { ElMessage } from 'element-plus';

const passwordPattern = /^(?=.*[A-Z])(?=.*\d).{6,}$/;

export default {
  name: "login",
  setup() {
    const authenticationStore = useAuthenticationStore();

    return { authenticationStore };
  },
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      rules: {
        email: [
          { required: true, message: 'Поле Email обязательно для заполнения', trigger: 'blur' },
          { type: 'email', message: 'Введите корректный email', trigger: 'blur' }
        ],
        password: [
          { required: true, message: 'Поле Пароль обязательно для заполнения', trigger: 'blur' },
          { min: 6, message: 'Пароль должен содержать не менее 6 символов', trigger: 'blur' },
          {
            pattern: passwordPattern,
            message:
              'Пароль должен содержать не менее одной заглавной буквы, одной цифры и быть длиной не менее 6 символов',
            trigger: 'blur'
          }
        ]
      },
      selectedAuthType: 'Авторизация',
      isLoading: false,
    };
  },
  methods: {
    async handleLogin() {
      try {
        const isValid = await this.$refs.formRef.validate();
      
        if (!isValid) {
          return;
        }

        this.isLoading = true;

        const checkResponse = await ApiClient.post('/auth/check-user-exists', { email: this.form.email });
        const userExists = checkResponse.data.exists;

        if (!userExists) {
          ElMessage.error('Пользователя с указанным email не существует');
          return;
        }

        const loginResponse = await ApiClient.post('/auth/login', this.form);
        const { token, refreshToken } = loginResponse.data;

        this.authenticationStore.login(token, refreshToken);
        ElMessage.success('Вы успешно вошли в аккаунт!');
        this.$router.push({ 
          name: 'expenses' 
        });
      } catch (error) {
        console.error('Ошибка при аутентификации:', error);
        ElMessage.error('Неверный email или пароль.');
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style lang="scss">
.authentication-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;

  .el-card {
    width: 415px;
    text-align: center;

    .el-form {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .el-form-item {
      text-align: left;
    }
  }
}

.authentication-title {
  display: block;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 30px;
}

.authentication-submit-button {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.segmented-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}
</style>