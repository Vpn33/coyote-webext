<template>
    <div>
        <h2 class="h5 mb-2">漫画脚本列表</h2>
        <el-table :data="mangaList" style="width: 100%">
            <el-table-column prop="bookId" label="漫画id"></el-table-column>
            <el-table-column prop="bookName" label="漫画名称"></el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" size="small" @click="editMangaScript(scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="deleteMangaScript(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>
import MyStorage from '../../lib/MyStorage';
export default {
    name: 'manga-script-list',
    data() {
        return {
            mangaList: MyStorage.mangaList(),
        }
    },
    methods: {
        editMangaScript(manga) {
            // 先更新Vuex状态，再进行路由跳转
            // console.log(manga);
            this.$store.dispatch('setEditMangaScript', manga).then(() => {
                this.$router.push({ name: 'MangaScriptEditor' });
            });
        },
        deleteMangaScript(manga) {
            this.$confirm('确定删除漫画脚本吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let index = this.mangaList.indexOf(manga);
                if (index !== -1) {
                    this.mangaList.splice(index, 1);
                    MyStorage.saveMangaList(this.mangaList);
                    this.$message.success('漫画脚本删除成功');
                }
            }).catch(() => {
                this.$message.info('已取消删除');
            });
        }
    },
}
</script>