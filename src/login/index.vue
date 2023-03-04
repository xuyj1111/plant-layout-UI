<template>
    <div id="back">
        <div class="login">
            <h2 id="title">Login</h2>
            <form @submit.prevent="login">
                <div class="form-group">
                    <label for="user">User:</label>
                    <input type="user" id="user" v-model="user" required>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" v-model="password" required>
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    </div>
</template>
  
<script>
export default {
    name: "Login",
    data() {
        return {
            user: '',
            password: ''
        };
    },
    methods: {
        login() {
            // 进行登录验证，调用后端API等
            // 如果登录成功，跳转到主页
            this.$router.push('/home');
        }
    }
};
</script>
  
<style scoped>
#back {
    width: 100%;
    height: 100%;
    background: url(../assets/background.jpg) no-repeat center center;
    position: relative;
}

.login {
    width: 420px;
    background: #969494;
    margin: 0 auto;
    opacity: 0.8;
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -40%);
}

.login #title {
    margin-left: 170px
}

.login .form-group {
    margin: 0 50px 20px;
}

.login label {
    display: block;
    margin-bottom: 5px;
}

.login input {
    width: 300px;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 16px;
}

.login button[type="submit"] {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-left: 165px;
    margin-bottom: 20px;
}
</style>
  