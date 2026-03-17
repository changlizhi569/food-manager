<template>
	<view class="modal-container">
		<view class="modal-card">
			<!-- 卡片头部 -->
			<view class="card-header">
				<text class="card-title">{{ ingredient.name || '食材详情' }}</text>
				<view class="close-btn" @click="goBack">
					<text class="close-icon">×</text>
				</view>
			</view>

			<!-- 卡片内容 -->
			<scroll-view class="card-content" scroll-y>
				<!-- 食材图片 -->
				<view class="image-section" v-if="settings.showImage && ingredient.imagePath">
					<image :src="ingredient.imagePath" class="ingredient-image" mode="aspectFit"></image>
				</view>

				<!-- 食材信息 -->
				<view class="info-section">
					<view class="info-title">📋 食材信息</view>

					<!-- 食材种类 -->
					<view class="info-item" v-if="settings.showType && ingredient.type">
						<text class="info-label">🏷️ 食材种类</text>
						<text class="info-value">{{ ingredient.type }}</text>
					</view>

					<!-- 分量 -->
					<view class="info-item" v-if="settings.showQuantity">
						<text class="info-label">⚖️ 分量</text>
						<text class="info-value">
							{{ ingredient.quantityGram ? ingredient.quantityGram + '克' : ingredient.quantityPortion + '份' }}
						</text>
					</view>

					<!-- 存放位置 -->
					<view class="info-item" v-if="settings.showLocation && ingredient.location">
						<text class="info-label">📍 存放位置</text>
						<text class="info-value">
							{{ ingredient.location }}{{ ingredient.layer ? ' - 第' + ingredient.layer + '层' : '' }}
						</text>
					</view>

					<!-- 加入日期 -->
					<view class="info-item" v-if="settings.showAddDate">
						<text class="info-label">📅 加入日期</text>
						<text class="info-value">{{ formatDate(ingredient.addDate) }}</text>
					</view>

					<!-- 保质期 -->
					<view class="info-item" v-if="settings.showExpiryDate">
						<text class="info-label">⏰ 保质期</text>
						<text class="info-value" :class="{ 'expired': isExpired }">{{ formatDate(ingredient.expiryDate) }}</text>
					</view>
				</view>

				<!-- 操作按钮 -->
				<view class="action-section">
					<view class="action-btn delete" @click="deleteIngredient">删除</view>
					<view class="action-btn edit" @click="navigateToEdit">编辑</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import { dataManager } from '../../utils/dataManager.js';

export default {
	name: 'IngredientDetailPage',
	data() {
		return {
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
				addDate: '',
				expiryDate: ''
			},
			settings: {
				showType: true,
				showQuantity: true,
				showLocation: true,
				showAddDate: true,
				showExpiryDate: true,
				showImage: true
			}
		};
	},
	computed: {
		isExpired() {
			if (!this.ingredient.expiryDate) return false;
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			const expiry = new Date(this.ingredient.expiryDate);
			return expiry < today;
		}
	},
	onLoad(options) {
		if (options.id) {
			this.loadIngredient(options.id);
		}
		this.loadSettings();
	},
	onShow() {
		this.loadSettings();
	},
	methods: {
		async loadIngredient(id) {
			const ingredients = await dataManager.getAllIngredients();
			const foundIngredient = ingredients.find(i => i.id === id);
			if (foundIngredient) {
				this.ingredient = foundIngredient;
			}
		},
		async loadSettings() {
			const savedSettings = dataManager.ingredientDetailSettings;
			if (savedSettings) {
				this.settings = { ...this.settings, ...savedSettings };
			}
		},
		goBack() {
			uni.reLaunch({
				url: '/pages/index/index'
			});
		},
		navigateToEdit() {
			uni.navigateTo({
				url: `/pages/ingredient/edit?id=${this.ingredient.id}`
			});
		},
		async deleteIngredient() {
			await dataManager.deleteIngredient(this.ingredient.id);
			uni.showToast({
				title: '删除成功',
				icon: 'success'
			});
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/index/index'
				});
			}, 1000);
		},
		formatDate(dateString) {
			if (!dateString) return '-';
			const date = new Date(dateString);
			return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
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

/* 图片区域 */
.image-section {
	width: 100%;
	height: 240rpx;
	background-color: #f8f9fa;
	border-radius: 24rpx;
	overflow: hidden;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	display: flex;
	align-items: center;
	justify-content: center;
}

.ingredient-image {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

/* 信息区域 */
.info-section {
	margin-bottom: 24rpx;
}

.info-title {
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

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 24rpx;
	background-color: #f8f9fa;
	border-radius: 16rpx;
	margin-bottom: 16rpx;
	transition: all 0.2s ease;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.info-item:last-child {
	margin-bottom: 0;
}

.info-label {
	font-size: 28rpx;
	color: #5a6c7d;
	font-weight: 500;
}

.info-value {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	text-align: right;
	flex: 1;
	margin-left: 20rpx;
}

.info-value.expired {
	color: #e74c3c;
	font-weight: 600;
}

/* 操作按钮 */
.action-section {
	display: flex;
	gap: 16rpx;
	padding: 20rpx;
	margin-top: 16rpx;
}

.action-btn {
	flex: 1;
	padding: 28rpx;
	border-radius: 16rpx;
	text-align: center;
	font-size: 32rpx;
	font-weight: 600;
	transition: all 0.2s ease;
}

.action-btn.delete {
	background-color: #fee;
	color: #e74c3c;
	box-shadow: 0 4rpx 12rpx rgba(231, 76, 60, 0.1);
}

.action-btn.delete:active {
	transform: translateY(2rpx);
	box-shadow: 0 2rpx 8rpx rgba(231, 76, 60, 0.1);
}

.action-btn.edit {
	background: linear-gradient(135deg, #4CAF50, #45a049);
	color: #fff;
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
}

.action-btn.edit:active {
	transform: translateY(2rpx);
	box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.3);
}
</style>
