<template>
    <div>
        <el-form ref="form" :model="mangaScript" label-width="80px" :rules="mangaRules">
            <el-form-item label="漫画id" prop="bookId">
                <el-input v-model="mangaScript.bookId" placeholder="请输入漫画id" />
            </el-form-item>
            <el-form-item label="漫画名称" prop="bookName">
                <el-input v-model="mangaScript.bookName" placeholder="请输入漫画名称" />
            </el-form-item>
            <el-form-item label="漫画脚本" prop="scriptList">
                <MangaPageImpl ref="mangaPageImpl" v-model="mangaScript.scriptList" @change="changeScriptList" />
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="onSubmit">保 存</el-button>
                <el-button @click="onCancel">取 消</el-button>
            </el-form-item>
        </el-form>

    </div>
</template>
<script>
import MyStorage from '../../lib/MyStorage';
import MangaPageImpl from './manga-page-impl.vue'
export default {
    name: 'MangaScriptEditor',
    components: {
        MangaPageImpl,
    },
    data() {
        return {
            mangaScript: {},
            mangaRules: {
                bookId: [
                    { required: true, message: '请输入漫画id', trigger: 'blur' }
                ],
                bookName: [
                    { required: true, message: '请输入漫画名称', trigger: 'blur' }
                ],
                scriptList: [
                    { required: true, message: '请输入一条漫画脚本', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        changeScriptList(scriptList) {
            this.mangaScript.scriptList = _.cloneDeep(scriptList);
            // console.log('changeScriptList', scriptList);
        },
        onSubmit() {
            this.$refs.form.validate((valid) => {
                if (valid) {
                    let mangaList = MyStorage.mangaList();
                    // 检查是否已存在相同的漫画脚本
                    let exist = _.findIndex(mangaList, item => item.bookId === this.mangaScript.bookId);
                    if (exist !== -1) {
                        this.$confirm('确定覆盖已存在的漫画脚本吗？', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => { 
                            mangaList[exist] = this.mangaScript;
                            MyStorage.saveMangaList(mangaList);
                            this.$message.success('漫画脚本保存成功');
                        }).catch(() => {
                            
                        });
                        return;
                    }
                    mangaList.push(this.mangaScript);
                    MyStorage.saveMangaList(mangaList);
                    this.$message.success('漫画脚本保存成功');
                } else {
                    console.log('校验失败');
                }
            });
        },
        onCancel() {
            // 取消编辑，清除Vuex中的漫画脚本数据
            this.$store.dispatch('clearEditMangaScript');
            this.$router.go(-1);
        },
    },
    beforeDestroy() {
        // 组件销毁前清除Vuex中的漫画脚本数据
        this.$store.dispatch('clearEditMangaScript')
    },
    mounted() {
        // 组件挂载时从Vuex获取当前编辑的脚本内容
        this.mangaScript = this.$store.state.editMangaScript || {};
        // console.log(this.mangaScript);
    }
}
</script>