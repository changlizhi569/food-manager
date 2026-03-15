/**
 * IndexedDB数据库管理类
 * 用于管理食材、冰箱、分区等数据
 */
class IndexedDBManager {
    constructor() {
        this.dbName = 'fridgeManagerDB';
        this.dbVersion = 1;
        this.db = null;
        this.ingredientDetailSettings = {
            showType: true,
            showQuantity: true,
            showLocation: true,
            showAddDate: true,
            showExpiryDate: true,
            showImage: true
        };
    }

    async init() {
        await this.openDB();
        await this.initDefaultData();
    }

    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error('数据库打开失败:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 创建冰箱存储
                if (!db.objectStoreNames.contains('fridges')) {
                    db.createObjectStore('fridges', { keyPath: 'id' });
                }

                // 创建分区存储
                if (!db.objectStoreNames.contains('partitions')) {
                    const partitionStore = db.createObjectStore('partitions', { keyPath: 'id' });
                    partitionStore.createIndex('fridgeId', 'fridgeId', { unique: false });
                }

                // 创建食材存储
                if (!db.objectStoreNames.contains('ingredients')) {
                    const ingredientStore = db.createObjectStore('ingredients', { keyPath: 'id' });
                    ingredientStore.createIndex('fridgeId', 'fridgeId', { unique: false });
                    ingredientStore.createIndex('partitionId', 'partitionId', { unique: false });
                    ingredientStore.createIndex('name', 'name', { unique: false });
                    ingredientStore.createIndex('type', 'type', { unique: false });
                }

                // 创建分类存储
                if (!db.objectStoreNames.contains('categories')) {
                    db.createObjectStore('categories', { keyPath: 'name' });
                }

                // 创建设置存储
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // 通用方法：获取存储
    getStore(storeName, mode = 'readonly') {
        if (!this.db) {
            throw new Error('数据库未打开');
        }
        const transaction = this.db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }

    // 通用方法：添加数据
    addData(storeName, data) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const request = store.add(data);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                console.error('添加数据失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // 通用方法：更新数据
    updateData(storeName, data) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const request = store.put(data);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                console.error('更新数据失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // 通用方法：删除数据
    deleteData(storeName, key) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const request = store.delete(key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                console.error('删除数据失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // 通用方法：获取所有数据
    getAllData(storeName) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName);
            const request = store.getAll();

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('获取数据失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // 通用方法：根据键获取数据
    getDataByKey(storeName, key) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName);
            const request = store.get(key);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('获取数据失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // 通用方法：根据索引获取数据
    getDataByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error('获取数据失败:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // 初始化默认数据
    async initDefaultData() {
        const fridges = await this.getAllData('fridges');
        if (fridges.length === 0) {
            // 创建默认冰箱
            const defaultFridge = {
                id: '1',
                name: '我的冰箱'
            };
            await this.addData('fridges', defaultFridge);

            // 创建默认分区
            const defaultPartition = {
                id: '1',
                name: '冷藏室',
                fridgeId: '1',
                layers: [1, 2]
            };
            await this.addData('partitions', defaultPartition);

            // 保存默认设置
            await this.updateData('settings', {
                key: 'currentFridgeId',
                value: '1'
            });
            await this.updateData('settings', {
                key: 'currentPartitionId',
                value: '1'
            });
            await this.updateData('settings', {
                key: 'currentLayer',
                value: null
            });
            await this.updateData('settings', {
                key: 'showOnlyFridge',
                value: false
            });
        }

        const categories = await this.getAllData('categories');
        if (categories.length === 0) {
            // 创建默认分类
            const defaultCategories = ['水果', '蔬菜', '奶制品', '饮料', '罐头'];
            for (const category of defaultCategories) {
                await this.addData('categories', { name: category });
            }
        }

        const settings = await this.getDataByKey('settings', 'ingredientDetailSettings');
        if (!settings) {
            await this.updateData('settings', {
                key: 'ingredientDetailSettings',
                value: this.ingredientDetailSettings
            });
        }
    }

    // 分类操作
    async addCategory(category) {
        const categories = await this.getAllData('categories');
        const exists = categories.some(c => c.name === category);
        if (!exists) {
            await this.addData('categories', { name: category });
        }
    }

    async deleteCategory(category) {
        await this.deleteData('categories', category);
    }

    async getCategories() {
        const categories = await this.getAllData('categories');
        return categories.map(c => c.name);
    }

    // 冰箱操作
    async addFridge(fridge) {
        await this.addData('fridges', fridge);
    }

    async updateFridge(fridge) {
        await this.updateData('fridges', fridge);
    }

    async deleteFridge(fridgeId) {
        // 删除冰箱
        await this.deleteData('fridges', fridgeId);
        
        // 删除关联的分区
        const partitions = await this.getDataByIndex('partitions', 'fridgeId', fridgeId);
        for (const partition of partitions) {
            await this.deleteData('partitions', partition.id);
        }
        
        // 删除关联的食材
        const ingredients = await this.getDataByIndex('ingredients', 'fridgeId', fridgeId);
        for (const ingredient of ingredients) {
            await this.deleteData('ingredients', ingredient.id);
        }
    }

    // 分区操作
    async addPartition(partition) {
        await this.addData('partitions', partition);
    }

    async updatePartition(partition) {
        await this.updateData('partitions', partition);
    }

    async deletePartition(partitionId) {
        // 删除分区
        await this.deleteData('partitions', partitionId);
        
        // 删除关联的食材
        const ingredients = await this.getDataByIndex('ingredients', 'partitionId', partitionId);
        for (const ingredient of ingredients) {
            await this.deleteData('ingredients', ingredient.id);
        }
    }

    // 食材操作
    async addIngredient(ingredient) {
        await this.addData('ingredients', ingredient);
    }

    async updateIngredient(ingredient) {
        await this.updateData('ingredients', ingredient);
    }

    async deleteIngredient(ingredientId) {
        await this.deleteData('ingredients', ingredientId);
    }

    async getIngredientsByFridgeAndPartition(fridgeId, partitionId, showOnlyFridge = false) {
        let filteredIngredients;
        if (showOnlyFridge) {
            // 只按冰箱筛选
            filteredIngredients = await this.getDataByIndex('ingredients', 'fridgeId', fridgeId);
        } else {
            // 按冰箱和分区筛选
            const fridgeIngredients = await this.getDataByIndex('ingredients', 'fridgeId', fridgeId);
            filteredIngredients = fridgeIngredients.filter(i => i.partitionId === partitionId);
        }
        // 按保质期到期时间排序（近→远）
        return filteredIngredients.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    }

    async searchIngredients(keyword) {
        const allIngredients = await this.getAllData('ingredients');
        if (!keyword || keyword.trim() === '') {
            return allIngredients;
        }
        
        const searchTerm = keyword.trim().toLowerCase();
        return allIngredients.filter(ingredient => {
            return ingredient.name.toLowerCase().includes(searchTerm) ||
                (ingredient.type && ingredient.type.toLowerCase().includes(searchTerm)) ||
                (ingredient.location && ingredient.location.toLowerCase().includes(searchTerm)) ||
                new Date(ingredient.addDate).toDateString().toLowerCase().includes(searchTerm) ||
                new Date(ingredient.expiryDate).toDateString().toLowerCase().includes(searchTerm);
        });
    }

    // 设置操作
    async getCurrentFridgeId() {
        const setting = await this.getDataByKey('settings', 'currentFridgeId');
        return setting ? setting.value : null;
    }

    async getCurrentPartitionId() {
        const setting = await this.getDataByKey('settings', 'currentPartitionId');
        return setting ? setting.value : null;
    }

    async getCurrentLayer() {
        const setting = await this.getDataByKey('settings', 'currentLayer');
        return setting ? setting.value : null;
    }

    async getShowOnlyFridge() {
        const setting = await this.getDataByKey('settings', 'showOnlyFridge');
        return setting ? setting.value : false;
    }

    async setCurrentFridgeAndPartition(fridgeId, partitionId, showOnlyFridge = false) {
        await this.updateData('settings', {
            key: 'currentFridgeId',
            value: fridgeId
        });
        await this.updateData('settings', {
            key: 'currentPartitionId',
            value: partitionId
        });
        await this.updateData('settings', {
            key: 'showOnlyFridge',
            value: showOnlyFridge
        });
    }

    async setCurrentLayer(layer) {
        await this.updateData('settings', {
            key: 'currentLayer',
            value: layer
        });
    }

    async updateIngredientDetailSettings(settings) {
        await this.updateData('settings', {
            key: 'ingredientDetailSettings',
            value: settings
        });
        this.ingredientDetailSettings = settings;
    }

    // 获取数据
    async getAllFridges() {
        return await this.getAllData('fridges');
    }

    async getAllPartitions() {
        return await this.getAllData('partitions');
    }

    async getAllIngredients() {
        return await this.getAllData('ingredients');
    }

    async getPartitionsByFridgeId(fridgeId) {
        return await this.getDataByIndex('partitions', 'fridgeId', fridgeId);
    }
}

// 导出单例实例
export const indexedDBManager = new IndexedDBManager();