/**
 * 数据管理类
 * 用于管理食材、冰箱、分区等数据
 * 使用localStorage进行存储
 */
// import { indexedDBManager } from './indexedDBManager.js';

class DataManager {
    constructor() {
        this.ingredientCardSettings = {
            showType: true,
            showQuantity: true,
            showLocation: true,
            showAddDate: true,
            showShelfLife: true,
            showImage: true
        };
        this.storageKey = 'fridgeManagerData';
        this.loadData();
    }

    async init() {
        // await indexedDBManager.init();
        // localStorage版本不需要异步初始化
        this.ensureDefaultData();
    }

    // 从存储加载数据
    loadData() {
        try {
            // 使用uni-app的跨平台存储API
            const data = uni.getStorageSync(this.storageKey);
            if (data) {
                try {
                    const parsedData = JSON.parse(data);
                    this.fridges = parsedData.fridges || [];
                    this.partitions = parsedData.partitions || [];
                    this.ingredients = parsedData.ingredients || [];
                    this.categories = parsedData.categories || [];
                    this.settings = parsedData.settings || {};
                } catch (e) {
                    console.error('解析数据失败:', e);
                    this.fridges = [];
                    this.partitions = [];
                    this.ingredients = [];
                    this.categories = [];
                    this.settings = {};
                }
            } else {
                this.fridges = [];
                this.partitions = [];
                this.ingredients = [];
                this.categories = [];
                this.settings = {};
            }
        } catch (e) {
            console.error('加载数据失败:', e);
            // 使用内存存储作为fallback
            this.fridges = [];
            this.partitions = [];
            this.ingredients = [];
            this.categories = [];
            this.settings = {};
        }
    }

    // 保存数据到存储
    saveData() {
        const data = {
            fridges: this.fridges,
            partitions: this.partitions,
            ingredients: this.ingredients,
            categories: this.categories,
            settings: this.settings
        };
        try {
            // 使用uni-app的跨平台存储API
            uni.setStorageSync(this.storageKey, JSON.stringify(data));
        } catch (e) {
            console.error('保存数据失败:', e);
        }
    }

    // 确保有默认数据
    ensureDefaultData() {
        if (this.fridges.length === 0) {
            this.fridges = [{
                id: '1',
                name: '我的冰箱'
            }];
            this.partitions = [{
                id: '1',
                name: '冷藏室',
                fridgeId: '1',
                layers: [1, 2]
            }];
            this.settings = {
                currentFridgeId: '1',
                currentPartitionId: '1',
                currentLayer: null,
                showOnlyFridge: false
            };
            this.saveData();
        }

        if (this.categories.length === 0) {
            this.categories = ['水果', '蔬菜', '奶制品', '饮料', '罐头'];
            this.saveData();
        }
    }

    // 分类操作
    async addCategory(category) {
        // await indexedDBManager.addCategory(category);
        if (!this.categories.includes(category)) {
            this.categories.push(category);
            this.saveData();
        }
    }

    async deleteCategory(category) {
        // await indexedDBManager.deleteCategory(category);
        this.categories = this.categories.filter(c => c !== category);
        this.saveData();
    }

    async getCategories() {
        // return await indexedDBManager.getCategories();
        return this.categories;
    }

    // 冰箱操作
    async addFridge(fridge) {
        // await indexedDBManager.addFridge(fridge);
        this.fridges.push(fridge);
        this.saveData();
    }

    async updateFridge(fridge) {
        // await indexedDBManager.updateFridge(fridge);
        const index = this.fridges.findIndex(f => f.id === fridge.id);
        if (index !== -1) {
            this.fridges[index] = fridge;
            this.saveData();
        }
    }

    async deleteFridge(fridgeId) {
        // await indexedDBManager.deleteFridge(fridgeId);
        this.fridges = this.fridges.filter(f => f.id !== fridgeId);
        this.partitions = this.partitions.filter(p => p.fridgeId !== fridgeId);
        // 不删除食材，而是将食材的存放位置设置为空
        this.ingredients.forEach(ingredient => {
            if (ingredient.fridgeId === fridgeId) {
                ingredient.fridgeId = '';
                ingredient.partitionId = '';
                ingredient.layer = '';
                ingredient.location = '';
            }
        });
        this.saveData();
    }

    // 分区操作
    async addPartition(partition) {
        // await indexedDBManager.addPartition(partition);
        this.partitions.push(partition);
        this.saveData();
    }

    async updatePartition(partition) {
        // await indexedDBManager.updatePartition(partition);
        const index = this.partitions.findIndex(p => p.id === partition.id);
        if (index !== -1) {
            this.partitions[index] = partition;
            // 检查是否有食材的层数不在新的层数列表中，如果是则将其层数设置为空
            this.ingredients.forEach(ingredient => {
                if (ingredient.partitionId === partition.id) {
                    const layer = parseInt(ingredient.layer);
                    if (!partition.layers.includes(layer)) {
                        ingredient.layer = '';
                    }
                }
            });
            this.saveData();
        }
    }

    async deletePartition(partitionId) {
        // await indexedDBManager.deletePartition(partitionId);
        this.partitions = this.partitions.filter(p => p.id !== partitionId);
        // 不删除食材，而是将食材的存放位置设置为空
        this.ingredients.forEach(ingredient => {
            if (ingredient.partitionId === partitionId) {
                ingredient.partitionId = '';
                ingredient.layer = '';
                ingredient.location = '';
            }
        });
        this.saveData();
    }

    // 食材操作
    async addIngredient(ingredient) {
        // await indexedDBManager.addIngredient(ingredient);
        this.ingredients.push(ingredient);
        this.saveData();
    }

    async updateIngredient(ingredient) {
        // await indexedDBManager.updateIngredient(ingredient);
        const index = this.ingredients.findIndex(i => i.id === ingredient.id);
        if (index !== -1) {
            this.ingredients[index] = ingredient;
            this.saveData();
        }
    }

    async deleteIngredient(ingredientId) {
        // await indexedDBManager.deleteIngredient(ingredientId);
        this.ingredients = this.ingredients.filter(i => i.id !== ingredientId);
        this.saveData();
    }

    async getIngredientsByFridgeAndPartition(fridgeId, partitionId, showOnlyFridge = false) {
        // return await indexedDBManager.getIngredientsByFridgeAndPartition(fridgeId, partitionId, showOnlyFridge);
        let filteredIngredients;
        if (showOnlyFridge) {
            filteredIngredients = this.ingredients.filter(i => i.fridgeId === fridgeId);
        } else {
            filteredIngredients = this.ingredients.filter(i => i.fridgeId === fridgeId && i.partitionId === partitionId);
        }
        return filteredIngredients.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    }

    async searchIngredients(keyword) {
        // return await indexedDBManager.searchIngredients(keyword);
        if (!keyword || keyword.trim() === '') {
            return this.ingredients;
        }
        
        const searchTerm = keyword.trim().toLowerCase();
        return this.ingredients.filter(ingredient => {
            return ingredient.name.toLowerCase().includes(searchTerm) ||
                (ingredient.type && ingredient.type.toLowerCase().includes(searchTerm)) ||
                (ingredient.location && ingredient.location.toLowerCase().includes(searchTerm)) ||
                new Date(ingredient.addDate).toDateString().toLowerCase().includes(searchTerm) ||
                new Date(ingredient.expiryDate).toDateString().toLowerCase().includes(searchTerm);
        });
    }

    // 设置操作
    async setCurrentFridgeAndPartition(fridgeId, partitionId, showOnlyFridge = false) {
        // await indexedDBManager.setCurrentFridgeAndPartition(fridgeId, partitionId, showOnlyFridge);
        this.settings.currentFridgeId = fridgeId;
        this.settings.currentPartitionId = partitionId;
        this.settings.showOnlyFridge = showOnlyFridge;
        this.saveData();
    }

    async setCurrentLayer(layer) {
        // await indexedDBManager.setCurrentLayer(layer);
        this.settings.currentLayer = layer;
        this.saveData();
    }

    async updateIngredientCardSettings(settings) {
        // await indexedDBManager.updateIngredientCardSettings(settings);
        this.ingredientCardSettings = settings;
        this.settings.ingredientCardSettings = settings;
        this.saveData();
    }

    // 获取数据
    async getAllFridges() {
        // return await indexedDBManager.getAllFridges();
        return this.fridges;
    }

    async getAllPartitions() {
        // return await indexedDBManager.getAllPartitions();
        return this.partitions;
    }

    async getAllIngredients() {
        // return await indexedDBManager.getAllIngredients();
        return this.ingredients;
    }

    async getPartitionsByFridgeId(fridgeId) {
        // return await indexedDBManager.getPartitionsByFridgeId(fridgeId);
        return this.partitions.filter(p => p.fridgeId === fridgeId);
    }

    async getCurrentFridgeId() {
        // return await indexedDBManager.getCurrentFridgeId();
        return this.settings.currentFridgeId || null;
    }

    async getCurrentPartitionId() {
        // return await indexedDBManager.getCurrentPartitionId();
        return this.settings.currentPartitionId || null;
    }

    async getCurrentLayer() {
        // return await indexedDBManager.getCurrentLayer();
        return this.settings.currentLayer || null;
    }

    async getShowOnlyFridge() {
        // return await indexedDBManager.getShowOnlyFridge();
        return this.settings.showOnlyFridge || false;
    }

    // 获取当前冰箱和分区
    async getCurrentFridge() {
        const fridgeId = await this.getCurrentFridgeId();
        if (!fridgeId) return null;
        const fridges = await this.getAllFridges();
        return fridges.find(f => f.id === fridgeId);
    }

    async getCurrentPartition() {
        const partitionId = await this.getCurrentPartitionId();
        if (!partitionId) return null;
        const partitions = await this.getAllPartitions();
        return partitions.find(p => p.id === partitionId);
    }

    // 获取所有可用的存放位置（从冰箱分区获取）
    async getAvailableLocations() {
        const locations = new Set();
        const partitions = await this.getAllPartitions();
        const fridges = await this.getAllFridges();
        
        partitions.forEach(partition => {
            const fridge = fridges.find(f => f.id === partition.fridgeId);
            if (fridge) {
                locations.add(`${fridge.name}-${partition.name}`);
            }
        });
        return Array.from(locations);
    }

    // 根据分区名称获取分区对象
    async getPartitionByName(partitionName) {
        const partitions = await this.getAllPartitions();
        const fridges = await this.getAllFridges();
        
        return partitions.find(p => {
            const fridge = fridges.find(f => f.id === p.fridgeId);
            return fridge && `${fridge.name}-${p.name}` === partitionName;
        });
    }
}

// 导出单例实例
export const dataManager = new DataManager();
