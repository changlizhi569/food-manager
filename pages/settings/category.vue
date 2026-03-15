<template>
	<view class="modal-container">
		<!-- 悬浮卡片 - 无遮罩，透显背景 -->
		<view class="modal-card scale-in">
			<!-- 卡片头部 -->
			<view class="card-header">
				<text class="card-title">食材种类管理</text>
				<view class="close-btn" @click="goBack">
					<text class="close-icon">×</text>
				</view>
			</view>

			<!-- 卡片内容 -->
			<scroll-view class="card-content" scroll-y>
				<!-- 添加新标签卡片 -->
				<view class="setting-card">
					<view class="section-header">
						<text class="section-icon">➕</text>
						<text class="section-label">添加新标签</text>
					</view>
					<view class="add-category-input">
						<input 
							type="text" 
							v-model="newCategory" 
							placeholder="输入标签名称"
							class="category-input"
						/>
						<view class="add-category-btn" @click="addCategory">
							<text class="btn-text">添加</text>
						</view>
					</view>
				</view>

				<!-- 已添加的标签卡片 -->
				<view class="setting-card">
					<view class="section-header">
						<text class="section-icon">🏷️</text>
						<text class="section-label">已添加的标签</text>
					</view>
					<view class="category-tags-container">
						<view 
							v-for="(category, index) in categories" 
							:key="category"
							class="category-tag-item"
						>
							<text class="tag-name">{{ category }}</text>
							<view class="tag-delete-btn" @click="deleteCategory(category, index)">
								<text class="delete-icon">×</text>
							</view>
						</view>
						<view v-if="categories.length === 0" class="empty-state">
							<text class="empty-text">暂无标签，请添加</text>
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
	name: 'CategoryManagementPage',
	data() {
		return {
			categories: [],
			newCategory: ''
		};
	},
	onLoad() {
		this.loadCategories();
	},
	methods: {
		async loadCategories() {
			this.categories = await dataManager.getCategories();
		},
		goBack() {
			uni.reLaunch({
				url: '/pages/index/index'
			});
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
			this.loadCategories();
			this.newCategory = '';

			uni.showToast({
				title: '添加成功',
				icon: 'success'
			});
		},
		async deleteCategory(category, index) {
			await dataManager.deleteCategory(category);
			this.loadCategories();

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
.setting-card {
	background-color: #f8f9fa;
	border-radius: 24rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.section-icon {
	font-size: 28rpx;
}

.section-label {
	font-size: 28rpx;
	font-weight: 600;
	color: #2c3e50;
}

.add-category-input {
	display: flex;
	gap: 16rpx;
}

.category-input {
	flex: 1;
	padding: 20rpx 24rpx;
	background-color: #fff;
	border: 2rpx solid transparent;
	border-radius: 16rpx;
	font-size: 28rpx;
	color: #2c3e50;
	transition: all 0.2s ease;
}

.category-input:focus {
	border-color: #4CAF50;
	box-shadow: 0 0 0 4rpx rgba(76, 175, 80, 0.1);
}

.add-category-btn {
	padding: 20rpx 32rpx;
	background: linear-gradient(135deg, #4CAF50, #45a049);
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
	transition: all 0.2s ease;
}

.add-category-btn:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.2);
}

.btn-text {
	font-size: 28rpx;
	color: #fff;
	font-weight: 600;
}

.category-tags-container {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.category-tag-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 16rpx 24rpx;
	background-color: #fff;
	border-radius: 28rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	transition: all 0.2s ease;
}

.category-tag-item:active {
	transform: scale(0.98);
}

.tag-name {
	font-size: 26rpx;
	color: #2c3e50;
	font-weight: 500;
}

.tag-delete-btn {
	width: 36rpx;
	height: 36rpx;
	background-color: #e74c3c;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
}

.tag-delete-btn:active {
	background-color: #c0392b;
	transform: scale(0.9);
}

.delete-icon {
	font-size: 24rpx;
	color: #fff;
	font-weight: bold;
}

.empty-state {
	width: 100%;
	padding: 40rpx;
	text-align: center;
}

.empty-text {
	font-size: 26rpx;
	color: #95a5a6;
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
