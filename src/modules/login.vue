<template>
    <div id="back">
        <el-form ref="form" :model="form" :rules="rules" class="login-box">
            <h2 class="title">欢迎登陆</h2>
            <el-form-item label="账号" class="item" prop="name">
                <el-input type="text" placeholder="请输入用户名" v-model="form.name" />
            </el-form-item>
            <el-form-item label="密码" class="item" prop="password">
                <el-input type="password" placeholder="请输入密码" v-model="form.password" />
            </el-form-item>
            <el-button type="primary" @click="onSubmit('form')" class="login-button">登录</el-button>
        </el-form>
    </div>
</template>
  
<script>
export default {
    name: "Login",
    data() {
        return {
            form: {
                name: "",
                password: ""
            },
            rules: {
                name: [
                    { required: true, message: '账号不能为空', trigger: 'submit' }
                ],
                password: [
                    { required: true, message: '密码不能为空', trigger: 'submit' }
                ]
            }
        }
    },
    methods: {
        /**
         * 
         * @param {*} formName 表单名
         * 1. 表单校验
         * 2. 登陆请求
         *      成功获得用户名（user）角色（role），跳转到‘/map’
         *      失败报错
         */
        onSubmit(formName) {
            this.$refs[formName].validate((valid) => {
                var that = this;
                if (valid) {
                    this.$axiosInstance.post("/login", {
                        user: this.form.name,
                        pwd: this.form.password
                    }).then(function (response) {
                        that.$store.state.user = that.form.name;
                        that.$store.state.role = response.data;
                        sessionStorage.setItem('isLogin', 'true');
                        that.$router.push('/map');
                    }).catch(function (error) {
                        console.log(error);
                        window.alert('账号密码错误！请重新输入！');
                        return false;
                    })
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        }
    }
};
</script>
  
<!-- 由于要设置el-form-item__label样式，需要去除scoped -->
<style>
#back {
    width: 100%;
    height: 100%;
    background: url(../assets/background.jpg) no-repeat center center;
    background-size: cover;
    position: relative;
}

.login-box {
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    border: 1px solid #DCDFE6;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 0 30px #DCDFE6;
    background-color: #e1dfdfed;
    opacity: 0.9;
}

.login-box .title {
    text-align: center;
}

.login-box .item .el-form-item__label {
    font-weight: bold;
    font-size: large;
    color: black;
}

.login-box .login-button {
    display: block;
    margin: 0 auto;
}
</style>
  