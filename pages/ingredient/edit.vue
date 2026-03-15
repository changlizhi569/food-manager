<template>
	<view class="modal-container">
		<!-- 悬浮卡片 - 无遮罩，透显背景 -->
		<view class="modal-card scale-in">
			<!-- 卡片头部 -->
			<view class="card-header">
				<text class="card-title">编辑食材</text>
				<view class="close-btn" @click="goBack">
					<text class="close-icon">×</text>
				</view>
			</view>

			<!-- 卡片内容 -->
			<scroll-view class="card-content" scroll-y>
				<!-- 图片上传 -->
				<view class="form-section">
					<view class="image-upload" @click="chooseImage">
						<image v-if="ingredient.imagePath" :src="ingredient.imagePath" class="uploaded-image" mode="aspectFill"></image>
						<view v-else class="upload-placeholder">
							<text class="upload-icon">📷</text>
							<text class="upload-text">点击上传图片</text>
						</view>
					</view>
				</view>

				<!-- 食材名称 -->
				<view class="form-section">
					<view class="section-title">
						<text class="section-icon">📝</text>
						<text>食材名称</text>
					</view>
					<input 
						type="text" 
						v-model="ingredient.name" 
						placeholder="请输入食材名称"
						class="form-input"
					/>
				</view>

				<!-- 食材分类 -->
				<view class="form-section">
					<view class="section-title">
						<text class="section-icon">🏷️</text>
						<text>食材分类</text>
					</view>
					<view class="category-list">
						<view 
							v-for="category in categories" 
							:key="category"
							class="category-tag"
							:class="{ active: ingredient.type === category }"
							@click="selectCategory(category)"
						>
							{{ category }}
						</view>
					</view>
				</view>

				<!-- 分量 -->
				<view class="form-section">
					<view class="section-title">
						<text class="section-icon">⚖️</text>
						<text>分量（二选一）</text>
					</view>
					<view class="quantity-inputs">
						<input 
							type="digit" 
							v-model="ingredient.quantityGram" 
							placeholder="多少克"
							class="quantity-input"
							@input="onGramInput"
						/>
						<input 
							type="digit" 
							v-model="ingredient.quantityPortion" 
							placeholder="多少份"
							class="quantity-input"
							@input="onPortionInput"
						/>
					</view>
				</view>

				<!-- 存放位置 -->
				<view class="form-section">
					<view class="section-title">
						<text class="section-icon">📍</text>
						<text>存放位置</text>
					</view>
					<view class="location-cards">
						<view class="location-card">
							<text class="location-label">冰箱</text>
							<picker mode="selector" :range="fridgeOptions" :value="selectedFridgeIndex" @change="onFridgeChange">
								<view class="picker-item">
									<text class="picker-value">{{ selectedFridgeName }}</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</view>
						<view class="location-card">
							<text class="location-label">分区</text>
							<picker mode="selector" :range="partitionOptions" :value="selectedPartitionIndex" @change="onPartitionChange">
								<view class="picker-item">
									<text class="picker-value">{{ selectedPartitionName }}</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</view>
						<view class="location-card" v-if="currentPartitionLayers.length > 0">
							<text class="location-label">层级</text>
							<picker mode="selector" :range="layerOptions" :value="selectedLayerIndex" @change="onLayerChange">
								<view class="picker-item">
									<text class="picker-value">{{ selectedLayerName }}</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</view>
					</view>
				</view>

				<!-- 加入日期 -->
				<view class="form-section">
					<view class="section-title">
						<text class="section-icon">📅</text>
						<text>加入日期</text>
					</view>
					<picker mode="date" :value="ingredient.addDate" @change="onAddDateChange">
						<view class="date-picker">
							<text class="date-text">{{ ingredient.addDate }}</text>
							<text class="calendar-icon">📅</text>
						</view>
					</picker>
				</view>

				<!-- 保鲜时间（天） -->
				<view class="form-section">
					<view class="section-title">
						<text class="section-icon">⏱️</text>
						<text>保鲜时间（天）</text>
					</view>
					<input 
						type="number" 
						v-model="freshDays" 
						placeholder="请输入保鲜天数"
						class="form-input"
						@input="calculateExpiryDate"
					/>
				</view>

				<!-- 保质期（到期日） -->
				<view class="form-section">
					<view class="section-title">
						<text class="section-icon">⏰</text>
						<text>保质期（到期日）</text>
					</view>
					<picker mode="date" :value="ingredient.expiryDate" @change="onExpiryDateChange">
						<view class="date-picker">
							<text class="date-text">{{ ingredient.expiryDate }}</text>
							<text class="calendar-icon">📅</text>
						</view>
					</picker>
				</view>

				<!-- 保存按钮 -->
				<view class="save-btn" @click="saveIngredient">
					<text class="save-text">保存</text>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import { dataManager } from '../../utils/dataManager.js';

export default {
	name: 'EditIngredientPage',
	data() {
		return {
			categories: [],
			fridges: [],
			partitions: [],
			quantityType: 'gram',
			freshDays: '',
			showCategoryModal: false,
			newCategory: '',
			ingredient: {
				id: '',
				name: '',
				type: '',
				imagePath: '',
				quantityGram: '',
				quantityPortion: '',
				fridgeId: '',
				partitionId: '',
				layer: '',
				location: '',
				addDate: this.getTodayDate(),
				expiryDate: this.getTodayDate()
			}
		};
	},
	computed: {
		currentPartition() {
			return this.partitions.find(p => p.id === this.ingredient.partitionId);
		},
		fridgeOptions() {
			return this.fridges.map(f => f.name);
		},
		partitionOptions() {
			const fridgePartitions = this.partitions.filter(p => p.fridgeId === this.ingredient.fridgeId);
			return fridgePartitions.map(p => p.name);
		},
		layerOptions() {
			if (this.currentPartition && this.currentPartition.layers) {
				return this.currentPartition.layers.map(l => `第${l}层`);
			}
			return [];
		},
		currentPartitionLayers() {
			if (this.currentPartition && this.currentPartition.layers) {
				return this.currentPartition.layers;
			}
			return [];
		},
		selectedFridgeIndex() {
			return this.fridges.findIndex(f => f.id === this.ingredient.fridgeId);
		},
		selectedPartitionIndex() {
			const fridgePartitions = this.partitions.filter(p => p.fridgeId === this.ingredient.fridgeId);
			return fridgePartitions.findIndex(p => p.id === this.ingredient.partitionId);
		},
		selectedLayerIndex() {
			if (this.currentPartition && this.currentPartition.layers) {
				return this.currentPartition.layers.findIndex(l => l === parseInt(this.ingredient.layer));
			}
			return -1;
		},
		selectedFridgeName() {
			const fridge = this.fridges.find(f => f.id === this.ingredient.fridgeId);
			return fridge ? fridge.name : '选择冰箱';
		},
		selectedPartitionName() {
			const partition = this.partitions.find(p => p.id === this.ingredient.partitionId);
			return partition ? partition.name : '选择分区';
		},
		selectedLayerName() {
			return this.ingredient.layer ? `第${this.ingredient.layer}层` : '选择层级';
		}
	},
	onLoad(options) {
		if (options.id) {
			this.loadIngredient(options.id);
		}
		this.initData();
	},
	methods: {
		getTodayDate() {
			const date = new Date();
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
		},
		async initData() {
			this.categories = await dataManager.getCategories();
			this.fridges = await dataManager.getAllFridges();
			this.partitions = await dataManager.getAllPartitions();
		},
		async loadIngredient(id) {
			const ingredients = await dataManager.getAllIngredients();
			const foundIngredient = ingredients.find(i => i.id === id);
			if (foundIngredient) {
				this.ingredient = { ...foundIngredient };
				// 设置分量类型
				if (this.ingredient.quantityGram) {
					this.quantityType = 'gram';
				} else {
					this.quantityType = 'portion';
				}
				// 计算保鲜天数
				const addDate = new Date(this.ingredient.addDate);
				const expiryDate = new Date(this.ingredient.expiryDate);
				const diffTime = expiryDate - addDate;
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				this.freshDays = diffDays > 0 ? diffDays.toString() : '';
			}
		},
		chooseImage() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					this.ingredient.imagePath = res.tempFilePaths[0];
				}
			});
		},
		selectCategory(category) {
			this.ingredient.type = category;
		},
		switchQuantityType(type) {
			this.quantityType = type;
			if (type === 'gram') {
				this.ingredient.quantityPortion = '';
			} else {
				this.ingredient.quantityGram = '';
			}
		},
		onGramInput() {
			// 如果输入了克数，清空份数
			if (this.ingredient.quantityGram && this.ingredient.quantityGram.trim() !== '') {
				this.ingredient.quantityPortion = '';
			}
		},
		onPortionInput() {
			// 如果输入了份数，清空克数
			if (this.ingredient.quantityPortion && this.ingredient.quantityPortion.trim() !== '') {
				this.ingredient.quantityGram = '';
			}
		},
		onFridgeChange(e) {
			const index = e.detail.value;
			this.ingredient.fridgeId = this.fridges[index].id;
			this.ingredient.partitionId = '';
			this.ingredient.layer = '';
			this.updateLocation();
		},
		onPartitionChange(e) {
			const index = e.detail.value;
			const fridgePartitions = this.partitions.filter(p => p.fridgeId === this.ingredient.fridgeId);
			this.ingredient.partitionId = fridgePartitions[index].id;
			this.ingredient.layer = '';
			this.updateLocation();
		},
		onLayerChange(e) {
			const index = e.detail.value;
			if (this.currentPartition && this.currentPartition.layers) {
				this.ingredient.layer = this.currentPartition.layers[index];
			}
			this.updateLocation();
		},
		updateLocation() {
			const fridge = this.fridges.find(f => f.id === this.ingredient.fridgeId);
			const partition = this.partitions.find(p => p.id === this.ingredient.partitionId);
			if (fridge && partition) {
				this.ingredient.location = `${fridge.name}-${partition.name}`;
			}
		},
		onAddDateChange(e) {
			this.ingredient.addDate = e.detail.value;
			this.calculateExpiryDate();
		},
		onExpiryDateChange(e) {
			this.ingredient.expiryDate = e.detail.value;
			const addDate = new Date(this.ingredient.addDate);
			const expiryDate = new Date(e.detail.value);
			const diffTime = expiryDate - addDate;
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			this.freshDays = diffDays > 0 ? diffDays.toString() : '';
		},
		calculateExpiryDate() {
			if (this.freshDays && this.ingredient.addDate) {
				const addDate = new Date(this.ingredient.addDate);
				const days = parseInt(this.freshDays);
				if (!isNaN(days)) {
					const expiryDate = new Date(addDate);
					expiryDate.setDate(expiryDate.getDate() + days);
					this.ingredient.expiryDate = `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, '0')}-${String(expiryDate.getDate()).padStart(2, '0')}`;
				}
			}
		},
		async saveIngredient() {
			if (!this.ingredient.name.trim()) {
				uni.showToast({
					title: '请输入食材名称',
					icon: 'none'
				});
				return;
			}

			if (!this.ingredient.fridgeId || !this.ingredient.partitionId) {
				uni.showToast({
					title: '请选择存放位置',
					icon: 'none'
				});
				return;
			}

			await dataManager.updateIngredient(this.ingredient);

			uni.showToast({
				title: '保存成功',
				icon: 'success'
			});

			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/index/index'
				});
			}, 1500);
		},
		goBack() {
			uni.reLaunch({
				url: '/pages/index/index'
			});
		},
		openCategoryModal() {
			this.showCategoryModal = true;
		},
		closeCategoryModal() {
			this.showCategoryModal = false;
			this.newCategory = '';
		},
		async addCategory() {
			if (!this.newCategory.trim()) {
				uni.showToast({
					title: '请输入标签名称',
					icon: 'none'
				});
				return;
			}

			if (this.categories.includes(this.newCategory.trim())) {
				uni.showToast({
					title: '该标签已存在',
					icon: 'none'
				});
				return;
			}

			await dataManager.addCategory(this.newCategory.trim());
			this.categories = await dataManager.getCategories();
			this.newCategory = '';

			uni.showToast({
				title: '添加成功',
				icon: 'success'
			});
		},
		async deleteCategory(category, index) {
			await dataManager.deleteCategory(category);
			this.categories = await dataManager.getCategories();
			
			if (this.ingredient.type === category) {
				this.ingredient.type = '';
			}

			uni.showToast({
				title: '删除成功',
				icon: 'success'
			});
		}
	}
};
</script>

<style scoped>
/* 悬浮窗容器 - 透明背景 */
.modal-container {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 999;
	pointer-events: none;
}

/* 悬浮卡片 */
.modal-card {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 92%;
	max-width: 640rpx;
	max-height: 88vh;
	background-color: #fff;
	border-radius: 32rpx;
	box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.15);
	display: flex;
	flex-direction: column;
	pointer-events: auto;
}

/* 卡片头部 */
.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx 36rpx;
	border-bottom: 1rpx solid #f0f4f0;
}

.card-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #2c3e50;
}

.close-btn {
	width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	transition: all 0.2s ease;
}

.close-btn:active {
	background-color: #f0f4f0;
}

.close-icon {
	font-size: 48rpx;
	color: #5a6c7d;
	line-height: 1;
}

/* 卡片内容 */
.card-content {
	max-height: calc(90vh - 160rpx);
	padding: 20rpx;
	overflow-y: auto;
	box-sizing: border-box;
	-webkit-overflow-scrolling: touch;
}

/* 滚动条样式 */
.card-content::-webkit-scrollbar {
	width: 6rpx;
}

.card-content::-webkit-scrollbar-track {
	background: #f1f1f1;
	border-radius: 3rpx;
}

.card-content::-webkit-scrollbar-thumb {
	background: #c1c1c1;
	border-radius: 3rpx;
}

.card-content::-webkit-scrollbar-thumb:hover {
	background: #a8a8a8;
}

.form-section {
	margin-bottom: 24rpx;
}

.section-title {
	display: flex;
	align-items: center;
	gap: 12rpx;
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 16rpx;
	text-shadow: 0 1rpx 1rpx rgba(0, 0, 0, 0.1);
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.section-icon {
	font-size: 28rpx;
}

/* 图片上传 */
.image-upload {
	width: 100%;
	height: 280rpx;
	background-color: #f8f9fa;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	transition: all 0.2s ease;
}

.image-upload:active {
	background-color: #f0f4f0;
}

.uploaded-image {
	width: 100%;
	height: 100%;
}

.upload-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
}

.upload-icon {
	font-size: 56rpx;
}

.upload-text {
	font-size: 26rpx;
	color: #95a5a6;
}

/* 表单输入 */
.form-input {
	width: 100%;
	padding: 24rpx;
	background-color: #f8f9fa;
	border-radius: 16rpx;
	font-size: 32rpx;
	color: #2c3e50;
	border: 2rpx solid transparent;
	transition: all 0.2s ease;
	text-shadow: 0 1rpx 1rpx rgba(0, 0, 0, 0.05);
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.form-input:focus {
	background-color: #fff;
	border-color: #4CAF50;
	box-shadow: 0 0 0 4rpx rgba(76, 175, 80, 0.1);
}

/* 分类标签 */
.category-list {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.category-tag {
	padding: 16rpx 28rpx;
	background-color: #f0f4f0;
	border-radius: 28rpx;
	font-size: 26rpx;
	color: #5a6c7d;
	transition: all 0.2s ease;
}

.category-tag.active {
	background: linear-gradient(135deg, #4CAF50, #45a049);
	color: #fff;
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
}

.category-tag:active {
	transform: scale(0.95);
}

/* 分量输入 */
.quantity-inputs {
	display: flex;
	gap: 16rpx;
}

.quantity-input {
	flex: 1;
	padding: 24rpx;
	background-color: #f8f9fa;
	border-radius: 16rpx;
	font-size: 28rpx;
	color: #2c3e50;
	border: 2rpx solid transparent;
	transition: all 0.2s ease;
	text-align: center;
}

.quantity-input:focus {
	background-color: #fff;
	border-color: #4CAF50;
	box-shadow: 0 0 0 4rpx rgba(76, 175, 80, 0.1);
}

.quantity-input:disabled {
	background-color: #e9ecef;
	color: #adb5bd;
}

/* 分量选择 - 保留兼容 */
.quantity-tabs {
	display: flex;
	gap: 16rpx;
	margin-bottom: 20rpx;
}

.quantity-tab {
	flex: 1;
	padding: 24rpx;
	background-color: #f0f4f0;
	border-radius: 16rpx;
	text-align: center;
	font-size: 28rpx;
	font-weight: 500;
	color: #5a6c7d;
	transition: all 0.2s ease;
}

.quantity-tab.active {
	background: linear-gradient(135deg, #4CAF50, #45a049);
	color: #fff;
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
}

.quantity-input-wrapper {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.quantity-input-wrapper .form-input {
	flex: 1;
}

.unit {
	font-size: 28rpx;
	color: #5a6c7d;
	min-width: 40rpx;
	font-weight: 500;
}

/* 位置选择卡片 */
.location-cards {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.location-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx;
	background-color: #f8f9fa;
	border-radius: 16rpx;
	transition: all 0.2s ease;
}

.location-card:active {
	background-color: #f0f4f0;
}

.location-label {
	font-size: 26rpx;
	color: #5a6c7d;
	font-weight: 500;
}

.picker-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.picker-value {
	font-size: 32rpx;
	color: #2c3e50;
	font-weight: 500;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.picker-arrow {
	font-size: 20rpx;
	color: #95a5a6;
}

/* 日期选择 */
.date-picker {
	padding: 24rpx;
	background-color: #f8f9fa;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: all 0.2s ease;
}

.date-picker:active {
	background-color: #f0f4f0;
}

.date-text {
	font-size: 32rpx;
	color: #2c3e50;
	font-weight: 500;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.calendar-icon {
	font-size: 32rpx;
}

/* 保存按钮 */
.save-btn {
	background: linear-gradient(135deg, #4CAF50, #45a049);
	padding: 28rpx;
	border-radius: 20rpx;
	text-align: center;
	margin-top: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.3);
	transition: all 0.2s ease;
}

.save-btn:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.2);
}

.save-text {
	font-size: 30rpx;
	color: #fff;
	font-weight: 600;
}

/* 响应式适配 */
@media screen and (max-width: 375px) {
	.card-content {
		height: calc(92vh - 70rpx);
		padding: 16rpx;
	}
	.form-section {
		margin-bottom: 20rpx;
	}
	.section-title {
		font-size: 28rpx;
	}
	.form-input,
	.picker-value,
	.date-text {
		font-size: 28rpx;
	}
	.image-upload {
		height: 240rpx;
	}
}

@media screen and (min-width: 768px) {
	.modal-card {
		width: 80%;
		max-width: 720rpx;
	}
	.card-content {
		height: calc(85vh - 80rpx);
	}
	.image-upload {
		height: 320rpx;
	}
}

@media screen and (min-width: 1024px) {
	.modal-card {
		width: 70%;
		max-width: 800rpx;
	}
	.card-content {
		height: calc(80vh - 80rpx);
	}
	.image-upload {
		height: 360rpx;
	}
}

/* 动画 */
.scale-in {
	animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
	from {
		opacity: 0;
		transform: translate(-50%, -50%) scale(0.9);
	}
	to {
		opacity: 1;
		transform: translate(-50%, -50%) scale(1);
	}
}
</style>
