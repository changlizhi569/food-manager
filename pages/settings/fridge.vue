<template>
	<view class="modal-container">
		<view class="modal-card">
			<!-- 卡片头部 -->
			<view class="card-header">
				<text class="card-title">冰箱管理</text>
				<view class="close-btn" @click="goBack">
					<text class="close-icon">×</text>
				</view>
			</view>

			<!-- 卡片内容 -->
			<scroll-view class="card-content" scroll-y>
				<!-- 创建冰箱按钮 -->
				<view class="create-section">
					<view class="create-btn" @click="addFridge">
						<text class="create-icon">➕</text>
						<text class="create-text">创建冰箱</text>
					</view>
				</view>

				<!-- 冰箱列表 -->
				<view class="fridge-list">
					<view v-for="fridge in fridges" :key="fridge.id" class="fridge-card">
						<!-- 冰箱头部信息 -->
						<view class="fridge-header">
							<view class="fridge-info">
								<!-- 冰箱名称编辑 -->
								<view v-if="editingFridgeId === fridge.id" class="name-edit">
									<input
										type="text"
										v-model="editingFridgeName"
										class="name-input"
										focus
										@blur="saveFridgeName(fridge.id)"
									/>
								</view>
								<text v-else class="fridge-name" @click.stop="startEditFridgeName(fridge)">{{ fridge.name }}</text>
								<text class="fridge-stats">{{ getPartitionsByFridgeId(fridge.id).length }} 个分区</text>
							</view>
							<view class="fridge-actions">
								<text class="action-btn add" @click.stop="addPartition(fridge.id)">➕</text>
								<text class="action-btn delete" @click.stop="deleteFridge(fridge.id)">🗑️</text>
							</view>
						</view>

						<!-- 分区列表 -->
						<view class="partition-list">
							<view v-for="partition in getPartitionsByFridgeId(fridge.id)" :key="partition.id" class="partition-item">
								<view class="partition-info">
									<!-- 分区名称编辑 -->
									<view v-if="editingPartitionId === partition.id && editingPartitionField === 'name'" class="field-edit">
										<input
											type="text"
											v-model="editingPartitionName"
											class="field-input"
											focus
											@blur="savePartitionName(partition.id)"
										/>
									</view>
									<text v-else class="partition-name" @click.stop="startEditPartitionName(partition)">{{ partition.name }}</text>

									<!-- 层数编辑 -->
								<view v-if="editingPartitionId === partition.id && editingPartitionField === 'layers'" class="field-edit">
									<text class="field-label">层数：</text>
									<picker mode="selector" :range="layerOptions" :value="editingPartitionLayers - 1" @change="onLayerChange">
										<view class="picker-value">{{ editingPartitionLayers }}层</view>
									</picker>
								</view>
								<view v-else class="partition-layers" @click.stop="startEditPartitionLayers(partition)">
									<text class="layer-display">层数：{{ partition.layers.length }}层</text>
								</view>
								</view>
								<text class="delete-btn" @click.stop="deletePartition(partition.id)">🗑️</text>
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
	name: 'FridgeSettingsPage',
	data() {
		return {
			fridges: [],
			partitions: [],
			// 冰箱编辑状态
			editingFridgeId: null,
			editingFridgeName: '',
			// 分区编辑状态
			editingPartitionId: null,
			editingPartitionField: '', // 'name' 或 'layers'
			editingPartitionName: '',
			editingPartitionLayers: 1,
			// 防止重复点击
			isAddingFridge: false,
			isAddingPartition: false,
			// 层数选项
			layerOptions: ['1层', '2层', '3层', '4层', '5层', '6层', '7层', '8层', '9层', '10层']
		};
	},
	onLoad() {
		this.loadData();
	},
	methods: {
		async loadData() {
			this.fridges = await dataManager.getAllFridges();
			this.partitions = await dataManager.getAllPartitions();
		},
		goBack() {
			uni.reLaunch({
				url: '/pages/index/index'
			});
		},
		getPartitionsByFridgeId(fridgeId) {
			return this.partitions.filter(p => p.fridgeId === fridgeId);
		},
		// 冰箱操作
		async addFridge() {
			if (this.isAddingFridge) return;
			this.isAddingFridge = true;
			
			const defaultName = '新冰箱' + (this.fridges.length + 1);
			const fridge = {
				id: Date.now().toString(),
				name: defaultName
			};
			await dataManager.addFridge(fridge);
			this.fridges.push(fridge);
			// 自动进入编辑模式
			this.editingFridgeId = fridge.id;
			this.editingFridgeName = defaultName;
			
			setTimeout(() => {
				this.isAddingFridge = false;
			}, 500);
		},
		startEditFridgeName(fridge) {
			this.editingFridgeId = fridge.id;
			this.editingFridgeName = fridge.name;
		},
		async saveFridgeName(fridgeId) {
			if (!this.editingFridgeName.trim()) {
				uni.showToast({ title: '名称不能为空', icon: 'none' });
				return;
			}
			const fridge = this.fridges.find(f => f.id === fridgeId);
			if (fridge) {
				fridge.name = this.editingFridgeName.trim();
				await dataManager.updateFridge(fridge);
			}
			this.editingFridgeId = null;
		},
		async deleteFridge(fridgeId) {
			await dataManager.deleteFridge(fridgeId);
			this.fridges = this.fridges.filter(f => f.id !== fridgeId);
			this.partitions = this.partitions.filter(p => p.fridgeId !== fridgeId);
		},
		// 分区操作
		async addPartition(fridgeId) {
			if (this.isAddingPartition) return;
			this.isAddingPartition = true;
			
			const partitions = this.getPartitionsByFridgeId(fridgeId);
			const defaultName = '新分区' + (partitions.length + 1);
			const partition = {
				id: Date.now().toString(),
				name: defaultName,
				fridgeId: fridgeId,
				layers: [1]
			};
			await dataManager.addPartition(partition);
			this.partitions.push(partition);
			// 自动进入名称编辑模式
			this.editingPartitionId = partition.id;
			this.editingPartitionField = 'name';
			this.editingPartitionName = defaultName;
			
			setTimeout(() => {
				this.isAddingPartition = false;
			}, 500);
		},
		startEditPartitionName(partition) {
			// 清除之前的编辑状态
			this.editingPartitionId = partition.id;
			this.editingPartitionField = 'name';
			this.editingPartitionName = partition.name;
		},
		async savePartitionName(partitionId) {
			if (!this.editingPartitionName.trim()) {
				uni.showToast({ title: '名称不能为空', icon: 'none' });
				return;
			}
			const partition = this.partitions.find(p => p.id === partitionId);
			if (partition) {
				partition.name = this.editingPartitionName.trim();
				await dataManager.updatePartition(partition);
			}
			this.editingPartitionId = null;
			this.editingPartitionField = '';
		},
		startEditPartitionLayers(partition) {
			// 清除之前的编辑状态
			this.editingPartitionId = partition.id;
			this.editingPartitionField = 'layers';
			this.editingPartitionLayers = partition.layers.length;
		},
		onLayerChange(e) {
			this.editingPartitionLayers = parseInt(e.detail.value) + 1;
			// 自动保存层数
			const partition = this.partitions.find(p => p.id === this.editingPartitionId);
			if (partition) {
				partition.layers = Array.from({ length: this.editingPartitionLayers }, (_, i) => i + 1);
				dataManager.updatePartition(partition);
			}
			this.editingPartitionId = null;
			this.editingPartitionField = '';
		},
		async savePartitionLayers(partitionId) {
			const layerCount = this.editingPartitionLayers;
			if (layerCount < 1 || layerCount > 10) {
				uni.showToast({ title: '层数需在1-10之间', icon: 'none' });
				return;
			}
			const partition = this.partitions.find(p => p.id === partitionId);
			if (partition) {
				partition.layers = Array.from({ length: layerCount }, (_, i) => i + 1);
				await dataManager.updatePartition(partition);
			}
			this.editingPartitionId = null;
			this.editingPartitionField = '';
		},
		async deletePartition(partitionId) {
			await dataManager.deletePartition(partitionId);
			this.partitions = this.partitions.filter(p => p.id !== partitionId);
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

/* 创建按钮区域 */
.create-section {
	margin-bottom: 24rpx;
}

.create-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	padding: 24rpx;
	background: linear-gradient(135deg, #4CAF50, #45a049);
	border-radius: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
	transition: all 0.2s ease;
}

.create-btn:active {
	transform: translateY(2rpx);
	box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.3);
}

.create-icon {
	font-size: 32rpx;
}

.create-text {
	font-size: 32rpx;
	color: #fff;
	font-weight: 600;
}

/* 冰箱列表 */
.fridge-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.fridge-card {
	background-color: #f8f9fa;
	border-radius: 20rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

/* 冰箱头部 */
.fridge-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 28rpx;
	background-color: #e8f5e9;
	border-bottom: 1rpx solid #c8e6c9;
}

.fridge-info {
	flex: 1;
}

.fridge-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #2e7d32;
	text-shadow: 0 1rpx 1rpx rgba(0, 0, 0, 0.05);
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.fridge-stats {
	display: block;
	font-size: 24rpx;
	color: #5a6c7d;
	margin-top: 8rpx;
	font-weight: 500;
}

.fridge-actions {
	display: flex;
	gap: 16rpx;
}

.action-btn {
	width: 56rpx;
	height: 56rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	border-radius: 12rpx;
	background-color: #fff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	transition: all 0.2s ease;
}

.action-btn.add {
	color: #4CAF50;
}

.action-btn.add:active {
	background-color: #e8f5e9;
	transform: scale(0.95);
}

.action-btn.delete {
	color: #f44336;
}

.action-btn.delete:active {
	background-color: #ffebee;
	transform: scale(0.95);
}

/* 分区列表 */
.partition-list {
	padding: 20rpx 24rpx;
}

.partition-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 0;
	border-bottom: 1rpx solid #e9ecef;
}

.partition-item:last-child {
	border-bottom: none;
}

.partition-info {
	flex: 1;
}

.partition-name {
	font-size: 30rpx;
	color: #2c3e50;
	font-weight: 500;
	text-shadow: 0 1rpx 1rpx rgba(0, 0, 0, 0.05);
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.partition-layers {
	display: flex;
	margin-top: 8rpx;
}

.layer-display {
	padding: 8rpx 16rpx;
	background-color: #e3f2fd;
	border-radius: 8rpx;
	font-size: 24rpx;
	color: #1976d2;
	font-weight: 500;
}

.picker-value {
	padding: 16rpx 24rpx;
	background-color: #fff;
	border: 2rpx solid #e0e0e0;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #333;
	min-width: 100rpx;
	text-align: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.delete-btn {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	color: #f44336;
	border-radius: 8rpx;
	transition: all 0.2s ease;
}

.delete-btn:active {
	background-color: #ffebee;
	transform: scale(0.95);
}

/* 编辑状态 */
.name-edit, .field-edit {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.name-input, .field-input {
	flex: 1;
	padding: 16rpx 20rpx;
	border: 2rpx solid #4CAF50;
	border-radius: 12rpx;
	font-size: 30rpx;
	background-color: #fff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.field-input.small {
	width: 120rpx;
	flex: none;
	text-align: center;
}

.field-label {
	font-size: 28rpx;
	color: #5a6c7d;
	font-weight: 500;
}

.save-btn {
	padding: 16rpx 24rpx;
	background: linear-gradient(135deg, #4CAF50, #45a049);
	color: #fff;
	border-radius: 12rpx;
	font-size: 26rpx;
	font-weight: 500;
	white-space: nowrap;
	box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.3);
	transition: all 0.2s ease;
}

.save-btn:active {
	transform: translateY(2rpx);
	box-shadow: 0 1rpx 4rpx rgba(76, 175, 80, 0.3);
}
</style>
