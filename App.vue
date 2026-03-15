<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 全局公共样式 - 卡片式设计风格 */
	
	/* 页面基础样式 */
	page {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
		background-color: #f8f9fa;
		color: #2c3e50;
		line-height: 1.5;
	}
	
	/* 通用容器 */
	.container {
		width: 100%;
		min-height: 100vh;
		background-color: #f8f9fa;
	}
	
	/* 卡片基础样式 */
	.card {
		background-color: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
		transition: all 0.3s ease;
	}
	
	.card-hover {
		transform: translateY(-4rpx);
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
	}
	
	/* 按钮样式 */
	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24rpx 48rpx;
		border-radius: 16rpx;
		font-size: 28rpx;
		font-weight: 500;
		transition: all 0.2s ease;
	}
	
	.btn-primary {
		background: linear-gradient(135deg, #4CAF50, #45a049);
		color: #ffffff;
		box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.3);
	}
	
	.btn-primary:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.2);
	}
	
	.btn-secondary {
		background-color: #f0f4f0;
		color: #4CAF50;
	}
	
	.btn-secondary:active {
		background-color: #e8f5e9;
	}
	
	.btn-danger {
		background-color: #ffebee;
		color: #ef5350;
	}
	
	/* 输入框样式 */
	.input {
		width: 100%;
		padding: 20rpx 24rpx;
		background-color: #f8f9fa;
		border: 2rpx solid #e8ecef;
		border-radius: 16rpx;
		font-size: 28rpx;
		color: #2c3e50;
		transition: all 0.2s ease;
		box-sizing: border-box;
	}
	
	.input:focus {
		border-color: #4CAF50;
		background-color: #ffffff;
		box-shadow: 0 0 0 4rpx rgba(76, 175, 80, 0.1);
	}
	
	/* 标签样式 */
	.tag {
		display: inline-flex;
		align-items: center;
		padding: 12rpx 24rpx;
		background-color: #f0f4f0;
		border-radius: 32rpx;
		font-size: 24rpx;
		color: #5a6c7d;
		transition: all 0.2s ease;
	}
	
	.tag.active {
		background-color: #4CAF50;
		color: #ffffff;
	}
	
	/* 选项卡样式 */
	.tab {
		padding: 16rpx 32rpx;
		border-radius: 32rpx;
		font-size: 28rpx;
		font-weight: 500;
		transition: all 0.2s ease;
		background-color: #f0f4f0;
		color: #5a6c7d;
	}
	
	.tab.active {
		background-color: #4CAF50;
		color: #ffffff;
		box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
	}
	
	/* 设置项样式 */
	.setting-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx;
		background-color: #ffffff;
		border-radius: 16rpx;
		margin-bottom: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	}
	
	.setting-item:last-child {
		margin-bottom: 0;
	}
	
	/* 复选框样式 */
	.checkbox {
		width: 44rpx;
		height: 44rpx;
		border: 2rpx solid #e8ecef;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
		background-color: #ffffff;
	}
	
	.checkbox.checked {
		background-color: #4CAF50;
		border-color: #4CAF50;
	}
	
	.checkbox-icon {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: bold;
	}
	
	/* 悬浮窗样式 - 透明背景 */
	.modal-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1000;
		pointer-events: none;
	}
	
	.modal-container .modal-card {
		pointer-events: auto;
	}
	
	/* 响应式布局 - 横屏适配 */
	@media screen and (min-width: 768px) {
		/* 横屏时卡片页面加宽 */
		.modal-card {
			width: 96% !important;
			max-width: 900rpx !important;
		}
	}

	@media screen and (min-width: 1024px) {
		/* 大屏横屏时卡片页面进一步加宽 */
		.modal-card {
			width: 98% !important;
			max-width: 1100rpx !important;
		}
	}
	
	/* 滚动条样式 */
	::-webkit-scrollbar {
		width: 6rpx;
		height: 6rpx;
	}
	
	::-webkit-scrollbar-track {
		background: transparent;
	}
	
	::-webkit-scrollbar-thumb {
		background: #d0d0d0;
		border-radius: 3rpx;
	}
	
	::-webkit-scrollbar-thumb:hover {
		background: #b0b0b0;
	}
	
	/* 动画效果 */
	.fade-in {
		animation: fadeIn 0.3s ease;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.scale-in {
		animation: scaleIn 0.3s ease;
	}
	
	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
