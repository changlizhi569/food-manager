<template>
	<view class="modal-container">
		<!-- 悬浮卡片 - 无遮罩，透显背景 -->
		<view class="modal-card scale-in">
			<!-- 卡片头部 -->
			<view class="card-header">
				<text class="card-title">设置</text>
				<view class="close-btn" @click="goBack">
					<text class="close-icon">×</text>
				</view>
			</view>

			<!-- 卡片内容 -->
			<scroll-view class="card-content" scroll-y>
				<view class="settings-cards">
					<!-- 冰箱设置 -->
					<view class="setting-card" @click="navigateToFridgeSettings">
						<view class="setting-icon-wrapper">
							<text class="setting-icon">🧊</text>
						</view>
						<view class="setting-info">
							<text class="setting-title">冰箱设置</text>
							<text class="setting-description">管理冰箱、分区、位置标签等</text>
						</view>
						<view class="setting-arrow">
							<text class="arrow-icon">›</text>
						</view>
					</view>

					<!-- 食材卡片设置 -->
					<view class="setting-card" @click="navigateToIngredientDetailSettings">
						<view class="setting-icon-wrapper">
							<text class="setting-icon">📋</text>
						</view>
						<view class="setting-info">
							<text class="setting-title">食材卡片设置</text>
							<text class="setting-description">可开关食材卡片中显示的各项字段</text>
						</view>
						<view class="setting-arrow">
							<text class="arrow-icon">›</text>
						</view>
					</view>

					<!-- 食材种类管理 -->
					<view class="setting-card" @click="navigateToCategoryManagement">
						<view class="setting-icon-wrapper">
							<text class="setting-icon">🏷️</text>
						</view>
						<view class="setting-info">
							<text class="setting-title">食材种类管理</text>
							<text class="setting-description">管理食材种类标签</text>
						</view>
						<view class="setting-arrow">
							<text class="arrow-icon">›</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import { dataManager } from '../../utils/dataManager.js';

export default {
	name: 'SettingsPage',
	data() {
		return {
		};
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		navigateToFridgeSettings() {
			uni.navigateTo({
				url: '/pages/settings/fridge'
			});
		},
		navigateToIngredientDetailSettings() {
			uni.navigateTo({
				url: '/pages/settings/ingredient-detail'
			});
		},
		navigateToCategoryManagement() {
			uni.navigateTo({
				url: '/pages/settings/category'
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
	z-index: 1000;
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
	overflow: hidden;
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
	height: calc(88vh - 100rpx);
	padding: 24rpx;
	overflow-y: auto;
}

/* 设置卡片 */
.settings-cards {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.setting-card {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 28rpx;
	background-color: #f8f9fa;
	border-radius: 20rpx;
	transition: all 0.2s ease;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.setting-card:active {
	background-color: #e8f5e9;
	transform: scale(0.98);
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.1);
}

.setting-icon-wrapper {
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.setting-icon {
	font-size: 40rpx;
}

.setting-info {
	flex: 1;
}

.setting-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 6rpx;
	display: block;
}

.setting-description {
	font-size: 24rpx;
	color: #95a5a6;
	display: block;
}

.setting-arrow {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.arrow-icon {
	font-size: 36rpx;
	color: #95a5a6;
	font-weight: 300;
}

/* 响应式适配 */
@media screen and (min-width: 768px) {
	.modal-card {
		width: 80%;
		max-width: 720rpx;
	}
	
	.setting-card {
		padding: 32rpx;
	}
}

@media screen and (min-width: 1024px) {
	.modal-card {
		width: 70%;
		max-width: 800rpx;
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
