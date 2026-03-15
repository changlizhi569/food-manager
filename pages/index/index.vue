<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="header-left">
				<view class="fridge-selector-trigger" @click="showSidebar">
					<text class="fridge-name">{{ currentFridgePartition }}</text>
					<text class="dropdown-icon">▼</text>
				</view>
			</view>
			<view class="header-center">
				<view class="search-container">
					<view class="search-box">
						<input 
							type="text" 
							v-model="searchInput" 
							placeholder="搜索食材..." 
							@confirm="searchIngredients"
						/>
						<view class="search-btn" @click="searchIngredients">
							<text class="search-icon">🔍</text>
						</view>
					</view>
				</view>
			</view>
			<view class="header-right">
				<view class="add-btn" @click="navigateToAddIngredient">
					<text class="add-icon">+</text>
				</view>
			</view>
		</view>
		
		<!-- 层级选项卡 - 显示分层 -->
		<view class="layer-tabs" v-if="!showSearchResult && currentPartition && currentPartition.layers && currentPartition.layers.length > 0 && !showOnlyFridge">
			<!-- <view class="selector-label">选择分层</view> -->
			<scroll-view class="layer-tabs-container" scroll-x>
				<view 
					class="layer-tab" 
					:class="{ active: currentLayer === null }"
					@click="setCurrentLayer(null)"
				>
					全部
				</view>
				<view 
					v-for="layer in currentPartition.layers" 
					:key="layer"
					class="layer-tab"
					:class="{ active: currentLayer === layer }"
					@click="setCurrentLayer(layer)"
				>
					第{{ layer }}层
				</view>
			</scroll-view>
		</view>

		<!-- 主要内容区域 -->
		<view class="main-content">
			<!-- 搜索结果标题 -->
			<view class="search-result-header" v-if="showSearchResult">
				<view class="search-result-title">搜索结果</view>
				<view class="search-result-content">{{ searchContent }}</view>
				<view class="clear-search-btn" @click="clearSearch">清除搜索</view>
			</view>
			
			<!-- 食材列表 -->
			<view class="ingredient-list" v-if="ingredients.length > 0">
				<view 
					v-for="ingredient in ingredients" 
					:key="ingredient.id"
					class="ingredient-card"
					@click="navigateToIngredientDetail(ingredient.id)"
				>
					<view class="ingredient-image-container" v-if="cardSettings.showImage !== false">
						<image 
							class="ingredient-image" 
							:src="ingredient.imagePath || '/static/logo.png'" 
							mode="aspectFill"
						/>
					</view>
					<view class="ingredient-info">
						<view class="ingredient-name">{{ ingredient.name }}</view>
						<view class="ingredient-type" v-if="cardSettings.showType && ingredient.type">
							<text class="type-icon">🏷️</text>
							<text class="type-text">{{ ingredient.type }}</text>
						</view>
						<view class="ingredient-detail">
							<view class="detail-item" v-if="cardSettings.showShelfLife !== false">
								<text class="detail-icon">📅</text>
								<text class="detail-text shelf-life-text">距离保质期：{{ getDaysUntilExpiry(ingredient.expiryDate) }} 天</text>
							</view>
							<view class="detail-item" v-if="cardSettings.showQuantity !== false">
								<text class="detail-icon">⚖️</text>
								<text class="detail-text">{{ ingredient.quantityGram ? ingredient.quantityGram + '克' : ingredient.quantityPortion + '份' }}</text>
							</view>
							<view class="detail-item location" v-if="cardSettings.showLocation !== false && ingredient.location">
								<text class="detail-icon">📍</text>
								<text class="detail-text location-text">{{ ingredient.location }}{{ ingredient.layer ? ' - 第' + ingredient.layer + '层' : '' }}</text>
							</view>
							<view class="detail-item" v-if="cardSettings.showAddDate">
								<text class="detail-icon">📆</text>
								<text class="detail-text">{{ formatDate(ingredient.addDate) }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view class="empty-state" v-else>
				<text class="empty-icon">🥗</text>
				<text class="empty-text" v-if="!showSearchResult">暂无食材，点击右上角添加</text>
				<text class="empty-text" v-else>未找到匹配的食材</text>
			</view>
		</view>

		<!-- 侧边栏 -->
		<view class="sidebar" :class="{ show: showSidebarFlag }" id="sidebar">
			<view class="sidebar-header">
				<text class="sidebar-title">冰箱管理</text>
				<view class="close-sidebar-btn" @click="hideSidebar">
					<text class="close-icon">×</text>
				</view>
			</view>
			<view class="sidebar-content" id="sidebarContent">
				<view 
					v-for="fridge in fridgesWithPartitions" 
					:key="fridge.id"
					class="fridge-section"
				>
					<view class="fridge-header">
						<text class="fridge-name">{{ fridge.name }}</text>
					</view>
					<view class="partition-list">
						<view 
							class="partition-item all"
							:class="{ active: currentFridgeId === fridge.id && showOnlyFridge }"
							@click="selectFridgeAndPartition(fridge.id, null, true)"
						>
							<text class="partition-text">全部</text>
						</view>
						<view 
							v-for="partition in fridge.partitions" 
							:key="partition.id"
							class="partition-item"
							:class="{ active: currentFridgeId === fridge.id && currentPartitionId === partition.id && !showOnlyFridge }"
							@click="selectFridgeAndPartition(fridge.id, partition.id, false)"
						>
							<text class="partition-text">{{ partition.name }}</text>
							<text class="partition-layers" v-if="partition.layers">{{ partition.layers.length }}层</text>
						</view>
					</view>
				</view>
			</view>
			<view class="sidebar-footer">
				<view class="settings-btn" @click="navigateToSettings">
					<text class="settings-icon">⚙️</text>
					<text class="settings-text">设置</text>
				</view>
			</view>
		</view>
		
		<!-- 侧边栏遮罩 -->
		<view class="sidebar-overlay" :class="{ show: showSidebarFlag }" @click="hideSidebar"></view>
	</view>
</template>

<script>
import { dataManager } from '../../utils/dataManager.js';

export default {
	name: 'IndexPage',
	data() {
		return {
			showSidebarFlag: false,
			searchInput: '',
			showSearchResult: false,
			searchContent: '',
			fridges: [],
			partitions: [],
			ingredients: [],
			currentFridgeId: null,
			currentPartitionId: null,
			currentLayer: null,
			showOnlyFridge: false,
			cardSettings: {
				showType: true,
				showQuantity: true,
				showLocation: true,
				showAddDate: false,
				showShelfLife: true,
				showImage: true
			}
		};
	},
	computed: {
		currentFridge() {
			return this.fridges.find(f => f.id === this.currentFridgeId);
		},
		currentPartition() {
			return this.partitions.find(p => p.id === this.currentPartitionId);
		},
		currentFridgePartitions() {
			if (!this.currentFridgeId) return [];
			return this.partitions.filter(p => p.fridgeId === this.currentFridgeId);
		},
		currentFridgePartition() {
			if (this.showOnlyFridge && this.currentFridge) {
				return `${this.currentFridge.name} (全部)`;
			} else if (this.currentFridge && this.currentPartition) {
				return `${this.currentFridge.name} - ${this.currentPartition.name}`;
			}
			return '选择冰箱';
		},
		fridgesWithPartitions() {
			return this.fridges.map(fridge => {
				return {
					...fridge,
					partitions: this.partitions.filter(p => p.fridgeId === fridge.id)
				};
			});
		}
	},
	onLoad() {
		this.initApp();
	},
	onShow() {
		this.loadData();
	},
	methods: {
		async initApp() {
			await dataManager.init();
			await this.loadData();
		},
		async loadData() {
			this.fridges = await dataManager.getAllFridges();
			this.partitions = await dataManager.getAllPartitions();
			this.ingredients = await dataManager.getAllIngredients();
			this.currentFridgeId = await dataManager.getCurrentFridgeId();
			this.currentPartitionId = await dataManager.getCurrentPartitionId();
			this.currentLayer = await dataManager.getCurrentLayer();
			this.showOnlyFridge = await dataManager.getShowOnlyFridge();
			// 加载卡片显示设置
			const savedSettings = dataManager.ingredientCardSettings;
			if (savedSettings) {
				// 兼容旧设置名称
				if (savedSettings.showExpiryDate !== undefined) {
					savedSettings.showShelfLife = savedSettings.showExpiryDate;
					delete savedSettings.showExpiryDate;
				}
				this.cardSettings = { ...this.cardSettings, ...savedSettings };
			}
			await this.filterIngredients();
		},
		async filterIngredients() {
			let filteredIngredients = await dataManager.getIngredientsByFridgeAndPartition(
				this.currentFridgeId,
				this.currentPartitionId,
				this.showOnlyFridge
			);

			if (this.currentLayer && !this.showOnlyFridge) {
				filteredIngredients = filteredIngredients.filter(ing => {
					return parseInt(ing.layer) === this.currentLayer;
				});
			}

			this.ingredients = filteredIngredients;
		},
		showSidebar() {
			this.showSidebarFlag = true;
		},
		hideSidebar() {
			this.showSidebarFlag = false;
		},
		async selectFridgeAndPartition(fridgeId, partitionId, onlyFridge) {
			this.currentFridgeId = fridgeId;
			this.currentPartitionId = partitionId;
			this.showOnlyFridge = onlyFridge;
			this.currentLayer = null;
			await dataManager.setCurrentFridgeAndPartition(fridgeId, partitionId, onlyFridge);
			await dataManager.setCurrentLayer(null);
			await this.filterIngredients();
			this.hideSidebar();
		},
		async selectPartition(partitionId) {
			this.currentPartitionId = partitionId;
			this.currentLayer = null;
			this.showOnlyFridge = false;
			await dataManager.setCurrentFridgeAndPartition(this.currentFridgeId, partitionId, false);
			await dataManager.setCurrentLayer(null);
			await this.filterIngredients();
		},
		async setCurrentLayer(layer) {
			this.currentLayer = layer;
			await dataManager.setCurrentLayer(layer);
			await this.filterIngredients();
		},
		async getPartitionsByFridgeId(fridgeId) {
			return await dataManager.getPartitionsByFridgeId(fridgeId);
		},
		navigateToAddIngredient() {
			uni.navigateTo({
				url: '/pages/ingredient/add'
			});
		},
		navigateToIngredientDetail(ingredientId) {
			uni.navigateTo({
				url: `/pages/ingredient/detail?id=${ingredientId}`
			});
		},
		navigateToSettings() {
			this.hideSidebar();
			uni.navigateTo({
				url: '/pages/settings/index'
			});
		},
		async searchIngredients() {
			let filteredIngredients = [];

			if (this.searchInput.trim()) {
				const searchTerm = this.searchInput.trim().toLowerCase();
				this.searchContent = `搜索: ${searchTerm}`;
				filteredIngredients = await dataManager.searchIngredients(searchTerm);
			}

			this.showSearchResult = true;
			this.ingredients = filteredIngredients;
		},
		async clearSearch() {
			this.showSearchResult = false;
			this.searchInput = '';
			await this.filterIngredients();
		},
		formatDate(dateString) {
			const date = new Date(dateString);
			return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
		},
		getDaysUntilExpiry(expiryDateString) {
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const expiryDate = new Date(expiryDateString);
			expiryDate.setHours(0, 0, 0, 0);
			const diffTime = expiryDate - today;
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return diffDays;
		},
		// 处理返回按钮点击
		onBackPress() {
			if (this.showSearchResult) {
				// 如果处于搜索状态，清除搜索并返回主页
				this.showSearchResult = false;
				this.searchInput = '';
				this.filterIngredients();
				return true; // 阻止默认返回行为
			}
			return false; // 执行默认返回行为
		}
	}
};
</script>

<style scoped>
.container {
	position: relative;
	width: 100%;
	min-height: 100vh;
	background-color: #f8f9fa;
}

/* 顶部导航栏 */
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	background-color: #fff;
	box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.08);
	border-radius: 0 0 24rpx 24rpx;
}

.header-left {
	flex-shrink: 0;
	margin-right: 24rpx;
}

.fridge-selector-trigger {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 24rpx;
	background-color: #f0f4f0;
	border-radius: 32rpx;
	transition: all 0.2s ease;
}

.fridge-selector-trigger:active {
	background-color: #e8f5e9;
	transform: scale(0.98);
}

.fridge-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #2c3e50;
	max-width: 200rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.dropdown-icon {
	font-size: 20rpx;
	color: #4CAF50;
}

.header-center {
	flex: 1;
	max-width: 480rpx;
}

.search-container {
	width: 100%;
}

.search-box {
	display: flex;
	align-items: center;
	background-color: #f8f9fa;
	border: 2rpx solid #e8ecef;
	border-radius: 32rpx;
	padding: 16rpx 24rpx;
	transition: all 0.2s ease;
}

.search-box:focus-within {
	border-color: #4CAF50;
	background-color: #fff;
	box-shadow: 0 0 0 4rpx rgba(76, 175, 80, 0.1);
}

.search-box input {
	flex: 1;
	border: none;
	background: transparent;
	font-size: 28rpx;
	padding: 8rpx 16rpx;
	color: #2c3e50;
}

.search-btn {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 8rpx;
	border-radius: 50%;
	transition: all 0.2s ease;
}

.search-btn:active {
	background-color: rgba(76, 175, 80, 0.1);
}

.search-icon {
	font-size: 28rpx;
	color: #5a6c7d;
}

.header-right {
	flex-shrink: 0;
	margin-left: 20rpx;
}

.add-btn {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #4CAF50, #45a049);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 6rpx 20rpx rgba(76, 175, 80, 0.4);
	transition: all 0.2s ease;
}

.add-btn:active {
	transform: scale(0.95);
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
}

.add-icon {
	color: #fff;
	font-size: 48rpx;
	font-weight: 700;
	line-height: 1;
	text-align: center;
	display: block;
}

/* 分区选择器 */
.partition-selector {
	background-color: #fff;
	padding: 24rpx 32rpx;
	margin-top: 16rpx;
	border-radius: 24rpx;
	margin-left: 16rpx;
	margin-right: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.selector-label {
	font-size: 26rpx;
	color: #5a6c7d;
	margin-bottom: 16rpx;
	font-weight: 500;
}

.partition-tabs {
	display: flex;
	gap: 16rpx;
	white-space: nowrap;
}

.partition-tab {
	display: inline-flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 28rpx;
	border-radius: 32rpx;
	background-color: #f0f4f0;
	transition: all 0.2s ease;
}

.partition-tab.active {
	background: linear-gradient(135deg, #4CAF50, #45a049);
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
}

.tab-text {
	font-size: 28rpx;
	font-weight: 500;
	color: #5a6c7d;
}

.partition-tab.active .tab-text {
	color: #fff;
}

.tab-badge {
	font-size: 20rpx;
	color: #4CAF50;
	background-color: #fff;
	padding: 4rpx 12rpx;
	border-radius: 16rpx;
}

.partition-tab.active .tab-badge {
	color: #4CAF50;
	background-color: rgba(255, 255, 255, 0.9);
}

/* 层级选项卡 */
.layer-tabs {
	background-color: #fff;
	padding: 24rpx 32rpx;
	margin-top: 16rpx;
	border-radius: 24rpx;
	margin-left: 16rpx;
	margin-right: 16rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.layer-tabs-container {
	display: flex;
	gap: 16rpx;
	white-space: nowrap;
}

.layer-tab {
	display: inline-flex;
	padding: 16rpx 32rpx;
	border-radius: 32rpx;
	background-color: #f0f4f0;
	font-size: 28rpx;
	font-weight: 500;
	color: #5a6c7d;
	transition: all 0.2s ease;
}

.layer-tab.active {
	background: linear-gradient(135deg, #4CAF50, #45a049);
	color: #fff;
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
}

.layer-tab:active {
	transform: scale(0.98);
}

/* 主要内容区域 */
.main-content {
	padding: 24rpx 32rpx;
	min-height: calc(100vh - 400rpx);
}

/* 搜索结果标题 */
.search-result-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: #fff;
	padding: 24rpx 32rpx;
	border-radius: 24rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.search-result-title {
	font-weight: 600;
	font-size: 30rpx;
	color: #2c3e50;
}

.search-result-content {
	flex: 1;
	margin: 0 24rpx;
	font-size: 26rpx;
	color: #5a6c7d;
}

.clear-search-btn {
	background-color: #f0f4f0;
	padding: 12rpx 24rpx;
	border-radius: 16rpx;
	font-size: 26rpx;
	color: #4CAF50;
	font-weight: 500;
	transition: all 0.2s ease;
}

.clear-search-btn:active {
	background-color: #e8f5e9;
	transform: scale(0.98);
}

/* 食材列表 */
.ingredient-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
	/* 移除 gap，使用 space-between 实现两端对齐 */
}

.ingredient-card {
	display: block;
	width: 100%;
	padding: 24rpx;
	margin-bottom: 0;
	background-color: #fff;
	border-radius: 24rpx;
	box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.06);
	box-sizing: border-box;
}

/* 小屏手机 - 每行1个 */
@media screen and (max-width: 374px) {
	.ingredient-card {
		width: 100%;
	}
}

/* 大屏手机 - 每行2个 */
@media screen and (min-width: 375px) and (max-width: 480px) {
	.ingredient-card {
		width: 48%;
	}
}

/* 小平板/大手机 - 每行2个 */
@media screen and (min-width: 481px) and (max-width: 767px) {
	.ingredient-card {
		width: 48%;
	}
}

/* 横屏平板 - 每行3个 */
@media screen and (min-width: 768px) and (max-width: 1023px) {
	.ingredient-card {
		width: 31%;
	}
}

/* 大屏平板 - 每行4个 */
@media screen and (min-width: 1024px) and (max-width: 1439px) {
	.ingredient-card {
		width: 23%;
	}
}

/* 超大屏 - 每行5个 */
@media screen and (min-width: 1440px) {
	.ingredient-card {
		width: 18%;
	}
}

.ingredient-image-container {
	width: 100%;
	height: 240rpx;
	border-radius: 18rpx;
	overflow: hidden;
}

.ingredient-image {
	width: 100%;
	height: 100%;
}

.ingredient-info {
	padding: 18rpx 12rpx 12rpx;
}

.ingredient-name {
	font-size: 45rpx;
	font-weight: 500;
	margin-bottom: 12rpx;
	color: #2c3e50;
}

.ingredient-type {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 8rpx;
}

.type-icon {
	font-size: 32rpx;
}

.type-text {
	font-size: 32rpx;
	color: #4CAF50;
	background-color: #f0f4f0;
	padding: 4rpx 16rpx;
	border-radius: 16rpx;
}

.ingredient-detail {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.detail-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.detail-icon {
	font-size: 36rpx;
}

.detail-text {
	font-size: 36rpx;
	color: #5a6c7d;
}

.shelf-life-text {
	font-weight: 600;
}

/* 空状态 */
.empty-state {
	display: block;
	padding: 40rpx;
	text-align: center;
}

.empty-icon {
	font-size: 60rpx;
	margin-bottom: 20rpx;
}

.empty-text {
	font-size: 28rpx;
}

/* 侧边栏 */
.sidebar {
	position: fixed;
	top: 0;
	left: -85%;
	width: 85%;
	height: 100vh;
	background-color: #fff;
	box-shadow: 6rpx 0 24rpx rgba(0, 0, 0, 0.12);
	z-index: 1000;
	transition: left 0.3s ease;
	display: flex;
	flex-direction: column;
	border-radius: 0 32rpx 32rpx 0;
}

.sidebar.show {
	left: 0;
}

.sidebar-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 48rpx 32rpx 32rpx;
	border-bottom: 1rpx solid #f0f4f0;
}

.sidebar-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #2c3e50;
}

.close-sidebar-btn {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	transition: all 0.2s ease;
}

.close-sidebar-btn:active {
	background-color: #f0f4f0;
}

.close-icon {
	font-size: 48rpx;
	color: #5a6c7d;
	line-height: 1;
}

.sidebar-content {
	flex: 1;
	padding: 32rpx 0;
	overflow-y: auto;
}

.fridge-section {
	margin-bottom: 40rpx;
}

.fridge-header {
	padding: 24rpx 32rpx;
}

.fridge-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
}

.partition-list {
	padding: 0 32rpx;
}

.partition-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 32rpx;
	margin: 12rpx 0;
	border-radius: 16rpx;
	background-color: #f8f9fa;
	transition: all 0.2s ease;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.partition-item.active {
	background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.15);
}

.partition-item.all {
	background-color: #f0f4f0;
	font-weight: 500;
}

.partition-item.all.active {
	background: linear-gradient(135deg, #4CAF50, #45a049);
}

.partition-item.all.active .partition-text {
	color: #fff;
}

.partition-text {
	font-size: 28rpx;
	color: #5a6c7d;
}

.partition-item.active .partition-text {
	color: #4CAF50;
	font-weight: 500;
}

.partition-layers {
	font-size: 22rpx;
	color: #95a5a6;
	background-color: #fff;
	padding: 6rpx 16rpx;
	border-radius: 16rpx;
}

.sidebar-footer {
	padding: 32rpx;
	border-top: 1rpx solid #f0f4f0;
	background-color: #fff;
	border-radius: 0 0 32rpx 0;
}

.settings-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	padding: 24rpx;
	background-color: #f8f9fa;
	border-radius: 16rpx;
	transition: all 0.2s ease;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.settings-btn:active {
	background-color: #e8f5e9;
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.15);
}

.settings-icon {
	font-size: 32rpx;
}

.settings-text {
	font-size: 30rpx;
	color: #2c3e50;
	font-weight: 500;
}

/* 侧边栏遮罩 */
.sidebar-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 999;
	opacity: 0;
	pointer-events: none;
	transition: opacity 0.3s ease;
}

.sidebar-overlay.show {
	opacity: 1;
	pointer-events: auto;
}

/* 响应式布局 - 横屏iPad适配 */
@media screen and (min-width: 768px) {
	.header {
		padding: 40rpx 48rpx;
	}
	
	.main-content {
		padding: 32rpx 48rpx;
	}
	
	.partition-selector,
	.layer-tabs {
		margin-left: 24rpx;
		margin-right: 24rpx;
	}
}

@media screen and (min-width: 1024px) {
	.header {
		padding: 48rpx 64rpx;
	}
	
	.main-content {
		padding: 40rpx 64rpx;
	}
	
	.partition-selector,
	.layer-tabs {
		margin-left: 32rpx;
		margin-right: 32rpx;
	}
	
	.sidebar {
		width: 70%;
		max-width: 600rpx;
		left: -70%;
	}
}
</style>
