<template>
	<view class="modal-container">
		<!-- 悬浮卡片 - 无遮罩，透显背景 -->
		<view class="modal-card scale-in">
			<!-- 卡片头部 -->
			<view class="card-header">
				<text class="card-title">食材卡片设置</text>
				<view class="close-btn" @click="goBack">
					<text class="close-icon">×</text>
				</view>
			</view>

			<!-- 卡片内容 -->
			<scroll-view class="card-content" scroll-y>
				<view class="settings-description">
					<text class="description-text">选择在食材卡片中显示哪些信息字段</text>
				</view>
				
				<!-- 设置卡片 -->
				<view class="settings-card">
					<!-- 显示食材种类 -->
					<view class="setting-item">
						<view class="setting-left">
							<view class="setting-icon-wrapper">
								<text class="setting-icon">🏷️</text>
							</view>
							<text class="setting-label">显示食材种类</text>
						</view>
						<view class="checkbox-wrapper" @click="toggleSetting('showType')">
							<view class="checkbox" :class="{ checked: settings.showType }">
								<text class="checkbox-icon" v-if="settings.showType">✓</text>
							</view>
						</view>
					</view>

					<!-- 显示分量 -->
					<view class="setting-item">
						<view class="setting-left">
							<view class="setting-icon-wrapper">
								<text class="setting-icon">⚖️</text>
							</view>
							<text class="setting-label">显示分量</text>
						</view>
						<view class="checkbox-wrapper" @click="toggleSetting('showQuantity')">
							<view class="checkbox" :class="{ checked: settings.showQuantity }">
								<text class="checkbox-icon" v-if="settings.showQuantity">✓</text>
							</view>
						</view>
					</view>

					<!-- 显示存放位置 -->
					<view class="setting-item">
						<view class="setting-left">
							<view class="setting-icon-wrapper">
								<text class="setting-icon">📍</text>
							</view>
							<text class="setting-label">显示存放位置</text>
						</view>
						<view class="checkbox-wrapper" @click="toggleSetting('showLocation')">
							<view class="checkbox" :class="{ checked: settings.showLocation }">
								<text class="checkbox-icon" v-if="settings.showLocation">✓</text>
							</view>
						</view>
					</view>

					<!-- 显示加入日期 -->
					<view class="setting-item">
						<view class="setting-left">
							<view class="setting-icon-wrapper">
								<text class="setting-icon">📅</text>
							</view>
							<text class="setting-label">显示加入日期</text>
						</view>
						<view class="checkbox-wrapper" @click="toggleSetting('showAddDate')">
							<view class="checkbox" :class="{ checked: settings.showAddDate }">
								<text class="checkbox-icon" v-if="settings.showAddDate">✓</text>
							</view>
						</view>
					</view>

					<!-- 显示保质期 -->
					<view class="setting-item">
						<view class="setting-left">
							<view class="setting-icon-wrapper">
								<text class="setting-icon">⏰</text>
							</view>
							<text class="setting-label">显示保质期</text>
						</view>
						<view class="checkbox-wrapper" @click="toggleSetting('showShelfLife')">
							<view class="checkbox" :class="{ checked: settings.showShelfLife }">
								<text class="checkbox-icon" v-if="settings.showShelfLife">✓</text>
							</view>
						</view>
					</view>

					<!-- 显示图片 -->
					<view class="setting-item">
						<view class="setting-left">
							<view class="setting-icon-wrapper">
								<text class="setting-icon">🖼️</text>
							</view>
							<text class="setting-label">显示图片</text>
						</view>
						<view class="checkbox-wrapper" @click="toggleSetting('showImage')">
							<view class="checkbox" :class="{ checked: settings.showImage }">
								<text class="checkbox-icon" v-if="settings.showImage">✓</text>
							</view>
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
	name: 'IngredientDetailSettingsPage',
	data() {
			return {
				settings: {
					showType: true,
					showQuantity: true,
					showLocation: true,
					showAddDate: false,
					showShelfLife: true,
					showImage: true
				}
			};
		},
	onLoad() {
		this.loadSettings();
	},
	methods: {
		loadSettings() {
			// 从dataManager获取设置
			const savedSettings = dataManager.ingredientCardSettings;
			if (savedSettings) {
				// 兼容旧设置名称
				if (savedSettings.showExpiryDate !== undefined) {
					savedSettings.showShelfLife = savedSettings.showExpiryDate;
					delete savedSettings.showExpiryDate;
				}
				this.settings = { ...this.settings, ...savedSettings };
			}
		},
		goBack() {
			uni.reLaunch({
				url: '/pages/index/index'
			});
		},
		toggleSetting(key) {
			this.settings[key] = !this.settings[key];
			dataManager.updateIngredientCardSettings(this.settings);
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

/* 描述文字 */
.settings-description {
	padding: 0 8rpx 20rpx;
}

.description-text {
	font-size: 26rpx;
	color: #95a5a6;
	line-height: 1.5;
}

/* 设置卡片 */
.settings-card {
	background-color: #f8f9fa;
	border-radius: 24rpx;
	padding: 16rpx;
	margin-bottom: 24rpx;
}

.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx;
	background-color: #fff;
	border-radius: 16rpx;
	margin-bottom: 12rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
	transition: all 0.2s ease;
}

.setting-item:last-child {
	margin-bottom: 0;
}

.setting-item:active {
	transform: scale(0.99);
}

.setting-left {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.setting-icon-wrapper {
	width: 56rpx;
	height: 56rpx;
	border-radius: 14rpx;
	background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.setting-icon {
	font-size: 28rpx;
}

.setting-label {
	font-size: 28rpx;
	color: #2c3e50;
	font-weight: 500;
}

.checkbox-wrapper {
	padding: 12rpx;
	margin: -12rpx;
}

.checkbox {
	width: 52rpx;
	height: 52rpx;
	border: 2rpx solid #e8ecef;
	border-radius: 14rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	background-color: #fff;
}

.checkbox.checked {
	background: linear-gradient(135deg, #4CAF50, #45a049);
	border-color: #4CAF50;
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
}

.checkbox-icon {
	font-size: 28rpx;
	color: #fff;
	font-weight: bold;
}

/* 保存按钮 */
.save-btn {
	background: linear-gradient(135deg, #4CAF50, #45a049);
	padding: 24rpx;
	border-radius: 20rpx;
	text-align: center;
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
@media screen and (min-width: 768px) {
	.modal-card {
		width: 80%;
		max-width: 720rpx;
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
