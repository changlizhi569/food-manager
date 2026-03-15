if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
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
      this.storageKey = "fridgeManagerData";
      this.loadData();
    }
    async init() {
      this.ensureDefaultData();
    }
    // 从存储加载数据
    loadData() {
      try {
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
            formatAppLog("error", "at utils/dataManager.js:42", "解析数据失败:", e);
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
        formatAppLog("error", "at utils/dataManager.js:57", "加载数据失败:", e);
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
        uni.setStorageSync(this.storageKey, JSON.stringify(data));
      } catch (e) {
        formatAppLog("error", "at utils/dataManager.js:80", "保存数据失败:", e);
      }
    }
    // 确保有默认数据
    ensureDefaultData() {
      if (this.fridges.length === 0) {
        this.fridges = [{
          id: "1",
          name: "我的冰箱"
        }];
        this.partitions = [{
          id: "1",
          name: "冷藏室",
          fridgeId: "1",
          layers: [1, 2]
        }];
        this.settings = {
          currentFridgeId: "1",
          currentPartitionId: "1",
          currentLayer: null,
          showOnlyFridge: false
        };
        this.saveData();
      }
      if (this.categories.length === 0) {
        this.categories = ["水果", "蔬菜", "奶制品", "饮料", "罐头"];
        this.saveData();
      }
    }
    // 分类操作
    async addCategory(category) {
      if (!this.categories.includes(category)) {
        this.categories.push(category);
        this.saveData();
      }
    }
    async deleteCategory(category) {
      this.categories = this.categories.filter((c) => c !== category);
      this.saveData();
    }
    async getCategories() {
      return this.categories;
    }
    // 冰箱操作
    async addFridge(fridge) {
      this.fridges.push(fridge);
      this.saveData();
    }
    async updateFridge(fridge) {
      const index = this.fridges.findIndex((f) => f.id === fridge.id);
      if (index !== -1) {
        this.fridges[index] = fridge;
        this.saveData();
      }
    }
    async deleteFridge(fridgeId) {
      this.fridges = this.fridges.filter((f) => f.id !== fridgeId);
      this.partitions = this.partitions.filter((p) => p.fridgeId !== fridgeId);
      this.ingredients = this.ingredients.filter((i) => i.fridgeId !== fridgeId);
      this.saveData();
    }
    // 分区操作
    async addPartition(partition) {
      this.partitions.push(partition);
      this.saveData();
    }
    async updatePartition(partition) {
      const index = this.partitions.findIndex((p) => p.id === partition.id);
      if (index !== -1) {
        this.partitions[index] = partition;
        this.saveData();
      }
    }
    async deletePartition(partitionId) {
      this.partitions = this.partitions.filter((p) => p.id !== partitionId);
      this.ingredients = this.ingredients.filter((i) => i.partitionId !== partitionId);
      this.saveData();
    }
    // 食材操作
    async addIngredient(ingredient) {
      this.ingredients.push(ingredient);
      this.saveData();
    }
    async updateIngredient(ingredient) {
      const index = this.ingredients.findIndex((i) => i.id === ingredient.id);
      if (index !== -1) {
        this.ingredients[index] = ingredient;
        this.saveData();
      }
    }
    async deleteIngredient(ingredientId) {
      this.ingredients = this.ingredients.filter((i) => i.id !== ingredientId);
      this.saveData();
    }
    async getIngredientsByFridgeAndPartition(fridgeId, partitionId, showOnlyFridge = false) {
      let filteredIngredients;
      if (showOnlyFridge) {
        filteredIngredients = this.ingredients.filter((i) => i.fridgeId === fridgeId);
      } else {
        filteredIngredients = this.ingredients.filter((i) => i.fridgeId === fridgeId && i.partitionId === partitionId);
      }
      return filteredIngredients.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    }
    async searchIngredients(keyword) {
      if (!keyword || keyword.trim() === "") {
        return this.ingredients;
      }
      const searchTerm = keyword.trim().toLowerCase();
      return this.ingredients.filter((ingredient) => {
        return ingredient.name.toLowerCase().includes(searchTerm) || ingredient.type && ingredient.type.toLowerCase().includes(searchTerm) || ingredient.location && ingredient.location.toLowerCase().includes(searchTerm) || new Date(ingredient.addDate).toDateString().toLowerCase().includes(searchTerm) || new Date(ingredient.expiryDate).toDateString().toLowerCase().includes(searchTerm);
      });
    }
    // 设置操作
    async setCurrentFridgeAndPartition(fridgeId, partitionId, showOnlyFridge = false) {
      this.settings.currentFridgeId = fridgeId;
      this.settings.currentPartitionId = partitionId;
      this.settings.showOnlyFridge = showOnlyFridge;
      this.saveData();
    }
    async setCurrentLayer(layer) {
      this.settings.currentLayer = layer;
      this.saveData();
    }
    async updateIngredientCardSettings(settings) {
      this.ingredientCardSettings = settings;
      this.settings.ingredientCardSettings = settings;
      this.saveData();
    }
    // 获取数据
    async getAllFridges() {
      return this.fridges;
    }
    async getAllPartitions() {
      return this.partitions;
    }
    async getAllIngredients() {
      return this.ingredients;
    }
    async getPartitionsByFridgeId(fridgeId) {
      return this.partitions.filter((p) => p.fridgeId === fridgeId);
    }
    async getCurrentFridgeId() {
      return this.settings.currentFridgeId || null;
    }
    async getCurrentPartitionId() {
      return this.settings.currentPartitionId || null;
    }
    async getCurrentLayer() {
      return this.settings.currentLayer || null;
    }
    async getShowOnlyFridge() {
      return this.settings.showOnlyFridge || false;
    }
    // 获取当前冰箱和分区
    async getCurrentFridge() {
      const fridgeId = await this.getCurrentFridgeId();
      if (!fridgeId)
        return null;
      const fridges = await this.getAllFridges();
      return fridges.find((f) => f.id === fridgeId);
    }
    async getCurrentPartition() {
      const partitionId = await this.getCurrentPartitionId();
      if (!partitionId)
        return null;
      const partitions = await this.getAllPartitions();
      return partitions.find((p) => p.id === partitionId);
    }
    // 获取所有可用的存放位置（从冰箱分区获取）
    async getAvailableLocations() {
      const locations = /* @__PURE__ */ new Set();
      const partitions = await this.getAllPartitions();
      const fridges = await this.getAllFridges();
      partitions.forEach((partition) => {
        const fridge = fridges.find((f) => f.id === partition.fridgeId);
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
      return partitions.find((p) => {
        const fridge = fridges.find((f) => f.id === p.fridgeId);
        return fridge && `${fridge.name}-${p.name}` === partitionName;
      });
    }
  }
  const dataManager = new DataManager();
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$8 = {
    name: "IndexPage",
    data() {
      return {
        showSidebarFlag: false,
        searchInput: "",
        showSearchResult: false,
        searchContent: "",
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
        return this.fridges.find((f) => f.id === this.currentFridgeId);
      },
      currentPartition() {
        return this.partitions.find((p) => p.id === this.currentPartitionId);
      },
      currentFridgePartitions() {
        if (!this.currentFridgeId)
          return [];
        return this.partitions.filter((p) => p.fridgeId === this.currentFridgeId);
      },
      currentFridgePartition() {
        if (this.showOnlyFridge && this.currentFridge) {
          return `${this.currentFridge.name} (全部)`;
        } else if (this.currentFridge && this.currentPartition) {
          return `${this.currentFridge.name} - ${this.currentPartition.name}`;
        }
        return "选择冰箱";
      },
      fridgesWithPartitions() {
        return this.fridges.map((fridge) => {
          return {
            ...fridge,
            partitions: this.partitions.filter((p) => p.fridgeId === fridge.id)
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
        const savedSettings = dataManager.ingredientCardSettings;
        if (savedSettings) {
          if (savedSettings.showExpiryDate !== void 0) {
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
          filteredIngredients = filteredIngredients.filter((ing) => {
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
          url: "/pages/ingredient/add"
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
          url: "/pages/settings/index"
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
        this.searchInput = "";
        await this.filterIngredients();
      },
      formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      },
      getDaysUntilExpiry(expiryDateString) {
        const today = /* @__PURE__ */ new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = new Date(expiryDateString);
        expiryDate.setHours(0, 0, 0, 0);
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
        return diffDays;
      },
      // 处理返回按钮点击
      onBackPress() {
        if (this.showSearchResult) {
          this.showSearchResult = false;
          this.searchInput = "";
          this.filterIngredients();
          return true;
        }
        return false;
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "header-left" }, [
          vue.createElementVNode("view", {
            class: "fridge-selector-trigger",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.showSidebar && $options.showSidebar(...args))
          }, [
            vue.createElementVNode(
              "text",
              { class: "fridge-name" },
              vue.toDisplayString($options.currentFridgePartition),
              1
              /* TEXT */
            ),
            vue.createElementVNode("text", { class: "dropdown-icon" }, "▼")
          ])
        ]),
        vue.createElementVNode("view", { class: "header-center" }, [
          vue.createElementVNode("view", { class: "search-container" }, [
            vue.createElementVNode("view", { class: "search-box" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "text",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.searchInput = $event),
                  placeholder: "搜索食材...",
                  onConfirm: _cache[2] || (_cache[2] = (...args) => $options.searchIngredients && $options.searchIngredients(...args))
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ), [
                [vue.vModelText, $data.searchInput]
              ]),
              vue.createElementVNode("view", {
                class: "search-btn",
                onClick: _cache[3] || (_cache[3] = (...args) => $options.searchIngredients && $options.searchIngredients(...args))
              }, [
                vue.createElementVNode("text", { class: "search-icon" }, "🔍")
              ])
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "header-right" }, [
          vue.createElementVNode("view", {
            class: "add-btn",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.navigateToAddIngredient && $options.navigateToAddIngredient(...args))
          }, [
            vue.createElementVNode("text", { class: "add-icon" }, "+")
          ])
        ])
      ]),
      !$data.showSearchResult && $options.currentPartition && $options.currentPartition.layers && $options.currentPartition.layers.length > 0 && !$data.showOnlyFridge ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "layer-tabs"
      }, [
        vue.createElementVNode("scroll-view", {
          class: "layer-tabs-container",
          "scroll-x": ""
        }, [
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["layer-tab", { active: $data.currentLayer === null }]),
              onClick: _cache[5] || (_cache[5] = ($event) => $options.setCurrentLayer(null))
            },
            " 全部 ",
            2
            /* CLASS */
          ),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.currentPartition.layers, (layer) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: layer,
                class: vue.normalizeClass(["layer-tab", { active: $data.currentLayer === layer }]),
                onClick: ($event) => $options.setCurrentLayer(layer)
              }, " 第" + vue.toDisplayString(layer) + "层 ", 11, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "main-content" }, [
        $data.showSearchResult ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "search-result-header"
        }, [
          vue.createElementVNode("view", { class: "search-result-title" }, "搜索结果"),
          vue.createElementVNode(
            "view",
            { class: "search-result-content" },
            vue.toDisplayString($data.searchContent),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", {
            class: "clear-search-btn",
            onClick: _cache[6] || (_cache[6] = (...args) => $options.clearSearch && $options.clearSearch(...args))
          }, "清除搜索")
        ])) : vue.createCommentVNode("v-if", true),
        $data.ingredients.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "ingredient-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.ingredients, (ingredient) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: ingredient.id,
                class: "ingredient-card",
                onClick: ($event) => $options.navigateToIngredientDetail(ingredient.id)
              }, [
                $data.cardSettings.showImage !== false ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "ingredient-image-container"
                }, [
                  vue.createElementVNode("image", {
                    class: "ingredient-image",
                    src: ingredient.imagePath || "/static/logo.png",
                    mode: "aspectFill"
                  }, null, 8, ["src"])
                ])) : vue.createCommentVNode("v-if", true),
                vue.createElementVNode("view", { class: "ingredient-info" }, [
                  vue.createElementVNode(
                    "view",
                    { class: "ingredient-name" },
                    vue.toDisplayString(ingredient.name),
                    1
                    /* TEXT */
                  ),
                  $data.cardSettings.showType && ingredient.type ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "ingredient-type"
                  }, [
                    vue.createElementVNode("text", { class: "type-icon" }, "🏷️"),
                    vue.createElementVNode(
                      "text",
                      { class: "type-text" },
                      vue.toDisplayString(ingredient.type),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true),
                  vue.createElementVNode("view", { class: "ingredient-detail" }, [
                    $data.cardSettings.showShelfLife !== false ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 0,
                      class: "detail-item"
                    }, [
                      vue.createElementVNode("text", { class: "detail-icon" }, "📅"),
                      vue.createElementVNode(
                        "text",
                        { class: "detail-text shelf-life-text" },
                        "距离保质期：" + vue.toDisplayString($options.getDaysUntilExpiry(ingredient.expiryDate)) + " 天",
                        1
                        /* TEXT */
                      )
                    ])) : vue.createCommentVNode("v-if", true),
                    $data.cardSettings.showQuantity !== false ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 1,
                      class: "detail-item"
                    }, [
                      vue.createElementVNode("text", { class: "detail-icon" }, "⚖️"),
                      vue.createElementVNode(
                        "text",
                        { class: "detail-text" },
                        vue.toDisplayString(ingredient.quantityGram ? ingredient.quantityGram + "克" : ingredient.quantityPortion + "份"),
                        1
                        /* TEXT */
                      )
                    ])) : vue.createCommentVNode("v-if", true),
                    $data.cardSettings.showLocation !== false && ingredient.location ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 2,
                      class: "detail-item location"
                    }, [
                      vue.createElementVNode("text", { class: "detail-icon" }, "📍"),
                      vue.createElementVNode(
                        "text",
                        { class: "detail-text location-text" },
                        vue.toDisplayString(ingredient.location) + vue.toDisplayString(ingredient.layer ? " - 第" + ingredient.layer + "层" : ""),
                        1
                        /* TEXT */
                      )
                    ])) : vue.createCommentVNode("v-if", true),
                    $data.cardSettings.showAddDate ? (vue.openBlock(), vue.createElementBlock("view", {
                      key: 3,
                      class: "detail-item"
                    }, [
                      vue.createElementVNode("text", { class: "detail-icon" }, "📆"),
                      vue.createElementVNode(
                        "text",
                        { class: "detail-text" },
                        vue.toDisplayString($options.formatDate(ingredient.addDate)),
                        1
                        /* TEXT */
                      )
                    ])) : vue.createCommentVNode("v-if", true)
                  ])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { class: "empty-icon" }, "🥗"),
          !$data.showSearchResult ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "empty-text"
          }, "暂无食材，点击右上角添加")) : (vue.openBlock(), vue.createElementBlock("text", {
            key: 1,
            class: "empty-text"
          }, "未找到匹配的食材"))
        ]))
      ]),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["sidebar", { show: $data.showSidebarFlag }]),
          id: "sidebar"
        },
        [
          vue.createElementVNode("view", { class: "sidebar-header" }, [
            vue.createElementVNode("text", { class: "sidebar-title" }, "冰箱管理"),
            vue.createElementVNode("view", {
              class: "close-sidebar-btn",
              onClick: _cache[7] || (_cache[7] = (...args) => $options.hideSidebar && $options.hideSidebar(...args))
            }, [
              vue.createElementVNode("text", { class: "close-icon" }, "×")
            ])
          ]),
          vue.createElementVNode("view", {
            class: "sidebar-content",
            id: "sidebarContent"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($options.fridgesWithPartitions, (fridge) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: fridge.id,
                  class: "fridge-section"
                }, [
                  vue.createElementVNode("view", { class: "fridge-header" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "fridge-name" },
                      vue.toDisplayString(fridge.name),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "partition-list" }, [
                    vue.createElementVNode("view", {
                      class: vue.normalizeClass(["partition-item all", { active: $data.currentFridgeId === fridge.id && $data.showOnlyFridge }]),
                      onClick: ($event) => $options.selectFridgeAndPartition(fridge.id, null, true)
                    }, [
                      vue.createElementVNode("text", { class: "partition-text" }, "全部")
                    ], 10, ["onClick"]),
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList(fridge.partitions, (partition) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: partition.id,
                          class: vue.normalizeClass(["partition-item", { active: $data.currentFridgeId === fridge.id && $data.currentPartitionId === partition.id && !$data.showOnlyFridge }]),
                          onClick: ($event) => $options.selectFridgeAndPartition(fridge.id, partition.id, false)
                        }, [
                          vue.createElementVNode(
                            "text",
                            { class: "partition-text" },
                            vue.toDisplayString(partition.name),
                            1
                            /* TEXT */
                          ),
                          partition.layers ? (vue.openBlock(), vue.createElementBlock(
                            "text",
                            {
                              key: 0,
                              class: "partition-layers"
                            },
                            vue.toDisplayString(partition.layers.length) + "层",
                            1
                            /* TEXT */
                          )) : vue.createCommentVNode("v-if", true)
                        ], 10, ["onClick"]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ]),
          vue.createElementVNode("view", { class: "sidebar-footer" }, [
            vue.createElementVNode("view", {
              class: "settings-btn",
              onClick: _cache[8] || (_cache[8] = (...args) => $options.navigateToSettings && $options.navigateToSettings(...args))
            }, [
              vue.createElementVNode("text", { class: "settings-icon" }, "⚙️"),
              vue.createElementVNode("text", { class: "settings-text" }, "设置")
            ])
          ])
        ],
        2
        /* CLASS */
      ),
      vue.createElementVNode(
        "view",
        {
          class: vue.normalizeClass(["sidebar-overlay", { show: $data.showSidebarFlag }]),
          onClick: _cache[9] || (_cache[9] = (...args) => $options.hideSidebar && $options.hideSidebar(...args))
        },
        null,
        2
        /* CLASS */
      )
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-1cf27b2a"], ["__file", "D:/Tare/food manager/pages/index/index.vue"]]);
  const _sfc_main$7 = {
    name: "AddIngredientPage",
    data() {
      return {
        categories: [],
        fridges: [],
        partitions: [],
        quantityType: "gram",
        freshDays: "",
        ingredient: {
          id: "",
          name: "",
          type: "",
          imagePath: "",
          quantityGram: "",
          quantityPortion: "",
          fridgeId: "",
          partitionId: "",
          layer: "",
          location: "",
          addDate: this.getTodayDate(),
          expiryDate: this.getTodayDate()
        }
      };
    },
    computed: {
      currentPartition() {
        return this.partitions.find((p) => p.id === this.ingredient.partitionId);
      },
      fridgeOptions() {
        return this.fridges.map((f) => f.name);
      },
      partitionOptions() {
        const fridgePartitions = this.partitions.filter((p) => p.fridgeId === this.ingredient.fridgeId);
        return fridgePartitions.map((p) => p.name);
      },
      layerOptions() {
        if (this.currentPartition && this.currentPartition.layers) {
          return this.currentPartition.layers.map((l) => `第${l}层`);
        }
        return [];
      },
      selectedFridgeIndex() {
        return this.fridges.findIndex((f) => f.id === this.ingredient.fridgeId);
      },
      selectedPartitionIndex() {
        const fridgePartitions = this.partitions.filter((p) => p.fridgeId === this.ingredient.fridgeId);
        return fridgePartitions.findIndex((p) => p.id === this.ingredient.partitionId);
      },
      selectedLayerIndex() {
        if (this.currentPartition && this.currentPartition.layers) {
          return this.currentPartition.layers.findIndex((l) => l === parseInt(this.ingredient.layer));
        }
        return -1;
      },
      selectedFridgeName() {
        const fridge = this.fridges.find((f) => f.id === this.ingredient.fridgeId);
        return fridge ? fridge.name : "选择冰箱";
      },
      selectedPartitionName() {
        const partition = this.partitions.find((p) => p.id === this.ingredient.partitionId);
        return partition ? partition.name : "选择分区";
      },
      selectedLayerName() {
        return this.ingredient.layer ? `第${this.ingredient.layer}层` : "选择层级";
      }
    },
    onLoad() {
      this.initData();
    },
    methods: {
      getTodayDate() {
        const date = /* @__PURE__ */ new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      },
      async initData() {
        this.categories = await dataManager.getCategories();
        this.fridges = await dataManager.getAllFridges();
        this.partitions = await dataManager.getAllPartitions();
        const currentFridgeId = await dataManager.getCurrentFridgeId();
        const currentPartitionId = await dataManager.getCurrentPartitionId();
        if (currentFridgeId) {
          this.ingredient.fridgeId = currentFridgeId;
        }
        if (currentPartitionId) {
          this.ingredient.partitionId = currentPartitionId;
          this.updateLocation();
        }
      },
      chooseImage() {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
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
        if (type === "gram") {
          this.ingredient.quantityPortion = "";
        } else {
          this.ingredient.quantityGram = "";
        }
      },
      onGramInput() {
        if (this.ingredient.quantityGram && this.ingredient.quantityGram.trim() !== "") {
          this.ingredient.quantityPortion = "";
        }
      },
      onPortionInput() {
        if (this.ingredient.quantityPortion && this.ingredient.quantityPortion.trim() !== "") {
          this.ingredient.quantityGram = "";
        }
      },
      onFridgeChange(e) {
        const index = e.detail.value;
        this.ingredient.fridgeId = this.fridges[index].id;
        this.ingredient.partitionId = "";
        this.ingredient.layer = "";
        this.updateLocation();
      },
      onPartitionChange(e) {
        const index = e.detail.value;
        const fridgePartitions = this.partitions.filter((p) => p.fridgeId === this.ingredient.fridgeId);
        this.ingredient.partitionId = fridgePartitions[index].id;
        this.ingredient.layer = "";
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
        const fridge = this.fridges.find((f) => f.id === this.ingredient.fridgeId);
        const partition = this.partitions.find((p) => p.id === this.ingredient.partitionId);
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
        const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
        this.freshDays = diffDays > 0 ? diffDays.toString() : "";
      },
      calculateExpiryDate() {
        if (this.freshDays && this.ingredient.addDate) {
          const addDate = new Date(this.ingredient.addDate);
          const days = parseInt(this.freshDays);
          if (!isNaN(days)) {
            const expiryDate = new Date(addDate);
            expiryDate.setDate(expiryDate.getDate() + days);
            this.ingredient.expiryDate = `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, "0")}-${String(expiryDate.getDate()).padStart(2, "0")}`;
          }
        }
      },
      async saveIngredient() {
        if (!this.ingredient.name.trim()) {
          uni.showToast({
            title: "请输入食材名称",
            icon: "none"
          });
          return;
        }
        if (!this.ingredient.fridgeId || !this.ingredient.partitionId) {
          uni.showToast({
            title: "请选择存放位置",
            icon: "none"
          });
          return;
        }
        this.ingredient.id = Date.now().toString();
        await dataManager.addIngredient(this.ingredient);
        uni.showToast({
          title: "添加成功",
          icon: "success"
        });
        setTimeout(() => {
          uni.reLaunch({
            url: "/pages/index/index"
          });
        }, 1500);
      },
      goBack() {
        uni.reLaunch({
          url: "/pages/index/index"
        });
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "modal-container" }, [
      vue.createElementVNode("view", { class: "modal-card" }, [
        vue.createElementVNode("view", { class: "card-header" }, [
          vue.createElementVNode("text", { class: "card-title" }, "添加食材"),
          vue.createElementVNode("view", {
            class: "close-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "close-icon" }, "×")
          ])
        ]),
        vue.createElementVNode("scroll-view", {
          class: "card-content",
          "scroll-y": ""
        }, [
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, "📷 食材图片"),
            vue.createElementVNode("view", {
              class: "image-upload",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.chooseImage && $options.chooseImage(...args))
            }, [
              $data.ingredient.imagePath ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 0,
                src: $data.ingredient.imagePath,
                class: "uploaded-image",
                mode: "aspectFill"
              }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "upload-placeholder"
              }, [
                vue.createElementVNode("text", { class: "upload-icon" }, "📷"),
                vue.createElementVNode("text", { class: "upload-text" }, "点击上传图片")
              ]))
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, "📝 食材名称"),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.ingredient.name = $event),
                placeholder: "请输入食材名称",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.ingredient.name]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, "🏷️ 食材分类"),
            vue.createElementVNode("view", { class: "category-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.categories, (category) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: category,
                    class: vue.normalizeClass(["category-tag", { active: $data.ingredient.type === category }]),
                    onClick: ($event) => $options.selectCategory(category)
                  }, vue.toDisplayString(category), 11, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, "⚖️ 分量（二选一）"),
            vue.createElementVNode("view", { class: "quantity-inputs" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "digit",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.ingredient.quantityGram = $event),
                  placeholder: "多少克",
                  class: "quantity-input",
                  onInput: _cache[4] || (_cache[4] = (...args) => $options.onGramInput && $options.onGramInput(...args))
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ), [
                [vue.vModelText, $data.ingredient.quantityGram]
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "digit",
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.ingredient.quantityPortion = $event),
                  placeholder: "多少份",
                  class: "quantity-input",
                  onInput: _cache[6] || (_cache[6] = (...args) => $options.onPortionInput && $options.onPortionInput(...args))
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ), [
                [vue.vModelText, $data.ingredient.quantityPortion]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, "📍 存放位置"),
            vue.createElementVNode("view", { class: "picker-group" }, [
              vue.createElementVNode("view", { class: "picker-item" }, [
                vue.createElementVNode("text", { class: "picker-label" }, "冰箱"),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: $options.fridgeOptions,
                  value: $options.selectedFridgeIndex,
                  onChange: _cache[7] || (_cache[7] = (...args) => $options.onFridgeChange && $options.onFridgeChange(...args))
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "picker-value" },
                    vue.toDisplayString($options.selectedFridgeName),
                    1
                    /* TEXT */
                  )
                ], 40, ["range", "value"])
              ]),
              vue.createElementVNode("view", { class: "picker-item" }, [
                vue.createElementVNode("text", { class: "picker-label" }, "分区"),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: $options.partitionOptions,
                  value: $options.selectedPartitionIndex,
                  onChange: _cache[8] || (_cache[8] = (...args) => $options.onPartitionChange && $options.onPartitionChange(...args))
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "picker-value" },
                    vue.toDisplayString($options.selectedPartitionName),
                    1
                    /* TEXT */
                  )
                ], 40, ["range", "value"])
              ]),
              vue.createElementVNode("view", { class: "picker-item" }, [
                vue.createElementVNode("text", { class: "picker-label" }, "层级"),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: $options.layerOptions,
                  value: $options.selectedLayerIndex,
                  onChange: _cache[9] || (_cache[9] = (...args) => $options.onLayerChange && $options.onLayerChange(...args))
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "picker-value" },
                    vue.toDisplayString($options.selectedLayerName),
                    1
                    /* TEXT */
                  )
                ], 40, ["range", "value"])
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, "📅 日期"),
            vue.createElementVNode("view", { class: "date-group" }, [
              vue.createElementVNode("view", { class: "date-item" }, [
                vue.createElementVNode("text", { class: "date-label" }, "添加日期"),
                vue.createElementVNode("picker", {
                  mode: "date",
                  value: $data.ingredient.addDate,
                  onChange: _cache[10] || (_cache[10] = (...args) => $options.onAddDateChange && $options.onAddDateChange(...args))
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "date-value" },
                    vue.toDisplayString($data.ingredient.addDate),
                    1
                    /* TEXT */
                  )
                ], 40, ["value"])
              ]),
              vue.createElementVNode("view", { class: "date-item" }, [
                vue.createElementVNode("text", { class: "date-label" }, "保鲜天数"),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    type: "number",
                    "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $data.freshDays = $event),
                    placeholder: "输入天数",
                    class: "days-input",
                    onInput: _cache[12] || (_cache[12] = (...args) => $options.calculateExpiryDate && $options.calculateExpiryDate(...args))
                  },
                  null,
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [vue.vModelText, $data.freshDays]
                ])
              ]),
              vue.createElementVNode("view", { class: "date-item" }, [
                vue.createElementVNode("text", { class: "date-label" }, "到期日期"),
                vue.createElementVNode("picker", {
                  mode: "date",
                  value: $data.ingredient.expiryDate,
                  onChange: _cache[13] || (_cache[13] = (...args) => $options.onExpiryDateChange && $options.onExpiryDateChange(...args))
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "date-value" },
                    vue.toDisplayString($data.ingredient.expiryDate),
                    1
                    /* TEXT */
                  )
                ], 40, ["value"])
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "save-section" }, [
            vue.createElementVNode("view", {
              class: "save-btn",
              onClick: _cache[14] || (_cache[14] = (...args) => $options.saveIngredient && $options.saveIngredient(...args))
            }, "保存")
          ])
        ])
      ])
    ]);
  }
  const PagesIngredientAdd = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-2c15c02d"], ["__file", "D:/Tare/food manager/pages/ingredient/add.vue"]]);
  const _sfc_main$6 = {
    name: "IngredientDetailPage",
    data() {
      return {
        ingredient: {
          id: "",
          name: "",
          type: "",
          imagePath: "",
          quantityGram: "",
          quantityPortion: "",
          fridgeId: "",
          partitionId: "",
          layer: "",
          location: "",
          addDate: "",
          expiryDate: ""
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
        if (!this.ingredient.expiryDate)
          return false;
        const today = /* @__PURE__ */ new Date();
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
        const foundIngredient = ingredients.find((i) => i.id === id);
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
          url: "/pages/index/index"
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
          title: "删除成功",
          icon: "success"
        });
        setTimeout(() => {
          uni.reLaunch({
            url: "/pages/index/index"
          });
        }, 1e3);
      },
      formatDate(dateString) {
        if (!dateString)
          return "-";
        const date = new Date(dateString);
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "modal-container" }, [
      vue.createElementVNode("view", { class: "modal-card" }, [
        vue.createElementVNode("view", { class: "card-header" }, [
          vue.createElementVNode(
            "text",
            { class: "card-title" },
            vue.toDisplayString($data.ingredient.name || "食材详情"),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", {
            class: "close-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "close-icon" }, "×")
          ])
        ]),
        vue.createElementVNode("scroll-view", {
          class: "card-content",
          "scroll-y": ""
        }, [
          $data.settings.showImage && $data.ingredient.imagePath ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "image-section"
          }, [
            vue.createElementVNode("image", {
              src: $data.ingredient.imagePath,
              class: "ingredient-image",
              mode: "aspectFill"
            }, null, 8, ["src"])
          ])) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", { class: "info-section" }, [
            vue.createElementVNode("view", { class: "info-title" }, "📋 食材信息"),
            $data.settings.showType && $data.ingredient.type ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "info-item"
            }, [
              vue.createElementVNode("text", { class: "info-label" }, "🏷️ 食材种类"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($data.ingredient.type),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            $data.settings.showQuantity ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "info-item"
            }, [
              vue.createElementVNode("text", { class: "info-label" }, "⚖️ 分量"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($data.ingredient.quantityGram ? $data.ingredient.quantityGram + "克" : $data.ingredient.quantityPortion + "份"),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            $data.settings.showLocation && $data.ingredient.location ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 2,
              class: "info-item"
            }, [
              vue.createElementVNode("text", { class: "info-label" }, "📍 存放位置"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($data.ingredient.location) + vue.toDisplayString($data.ingredient.layer ? " - 第" + $data.ingredient.layer + "层" : ""),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            $data.settings.showAddDate ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 3,
              class: "info-item"
            }, [
              vue.createElementVNode("text", { class: "info-label" }, "📅 加入日期"),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($options.formatDate($data.ingredient.addDate)),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true),
            $data.settings.showExpiryDate ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 4,
              class: "info-item"
            }, [
              vue.createElementVNode("text", { class: "info-label" }, "⏰ 保质期"),
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass(["info-value", { "expired": $options.isExpired }])
                },
                vue.toDisplayString($options.formatDate($data.ingredient.expiryDate)),
                3
                /* TEXT, CLASS */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "action-section" }, [
            vue.createElementVNode("view", {
              class: "action-btn delete",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.deleteIngredient && $options.deleteIngredient(...args))
            }, "删除"),
            vue.createElementVNode("view", {
              class: "action-btn edit",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.navigateToEdit && $options.navigateToEdit(...args))
            }, "编辑")
          ])
        ])
      ])
    ]);
  }
  const PagesIngredientDetail = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-f908e122"], ["__file", "D:/Tare/food manager/pages/ingredient/detail.vue"]]);
  const _sfc_main$5 = {
    name: "EditIngredientPage",
    data() {
      return {
        categories: [],
        fridges: [],
        partitions: [],
        quantityType: "gram",
        freshDays: "",
        showCategoryModal: false,
        newCategory: "",
        ingredient: {
          id: "",
          name: "",
          type: "",
          imagePath: "",
          quantityGram: "",
          quantityPortion: "",
          fridgeId: "",
          partitionId: "",
          layer: "",
          location: "",
          addDate: this.getTodayDate(),
          expiryDate: this.getTodayDate()
        }
      };
    },
    computed: {
      currentPartition() {
        return this.partitions.find((p) => p.id === this.ingredient.partitionId);
      },
      fridgeOptions() {
        return this.fridges.map((f) => f.name);
      },
      partitionOptions() {
        const fridgePartitions = this.partitions.filter((p) => p.fridgeId === this.ingredient.fridgeId);
        return fridgePartitions.map((p) => p.name);
      },
      layerOptions() {
        if (this.currentPartition && this.currentPartition.layers) {
          return this.currentPartition.layers.map((l) => `第${l}层`);
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
        return this.fridges.findIndex((f) => f.id === this.ingredient.fridgeId);
      },
      selectedPartitionIndex() {
        const fridgePartitions = this.partitions.filter((p) => p.fridgeId === this.ingredient.fridgeId);
        return fridgePartitions.findIndex((p) => p.id === this.ingredient.partitionId);
      },
      selectedLayerIndex() {
        if (this.currentPartition && this.currentPartition.layers) {
          return this.currentPartition.layers.findIndex((l) => l === parseInt(this.ingredient.layer));
        }
        return -1;
      },
      selectedFridgeName() {
        const fridge = this.fridges.find((f) => f.id === this.ingredient.fridgeId);
        return fridge ? fridge.name : "选择冰箱";
      },
      selectedPartitionName() {
        const partition = this.partitions.find((p) => p.id === this.ingredient.partitionId);
        return partition ? partition.name : "选择分区";
      },
      selectedLayerName() {
        return this.ingredient.layer ? `第${this.ingredient.layer}层` : "选择层级";
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
        const date = /* @__PURE__ */ new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      },
      async initData() {
        this.categories = await dataManager.getCategories();
        this.fridges = await dataManager.getAllFridges();
        this.partitions = await dataManager.getAllPartitions();
      },
      async loadIngredient(id) {
        const ingredients = await dataManager.getAllIngredients();
        const foundIngredient = ingredients.find((i) => i.id === id);
        if (foundIngredient) {
          this.ingredient = { ...foundIngredient };
          if (this.ingredient.quantityGram) {
            this.quantityType = "gram";
          } else {
            this.quantityType = "portion";
          }
          const addDate = new Date(this.ingredient.addDate);
          const expiryDate = new Date(this.ingredient.expiryDate);
          const diffTime = expiryDate - addDate;
          const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
          this.freshDays = diffDays > 0 ? diffDays.toString() : "";
        }
      },
      chooseImage() {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
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
        if (type === "gram") {
          this.ingredient.quantityPortion = "";
        } else {
          this.ingredient.quantityGram = "";
        }
      },
      onGramInput() {
        if (this.ingredient.quantityGram && this.ingredient.quantityGram.trim() !== "") {
          this.ingredient.quantityPortion = "";
        }
      },
      onPortionInput() {
        if (this.ingredient.quantityPortion && this.ingredient.quantityPortion.trim() !== "") {
          this.ingredient.quantityGram = "";
        }
      },
      onFridgeChange(e) {
        const index = e.detail.value;
        this.ingredient.fridgeId = this.fridges[index].id;
        this.ingredient.partitionId = "";
        this.ingredient.layer = "";
        this.updateLocation();
      },
      onPartitionChange(e) {
        const index = e.detail.value;
        const fridgePartitions = this.partitions.filter((p) => p.fridgeId === this.ingredient.fridgeId);
        this.ingredient.partitionId = fridgePartitions[index].id;
        this.ingredient.layer = "";
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
        const fridge = this.fridges.find((f) => f.id === this.ingredient.fridgeId);
        const partition = this.partitions.find((p) => p.id === this.ingredient.partitionId);
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
        const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
        this.freshDays = diffDays > 0 ? diffDays.toString() : "";
      },
      calculateExpiryDate() {
        if (this.freshDays && this.ingredient.addDate) {
          const addDate = new Date(this.ingredient.addDate);
          const days = parseInt(this.freshDays);
          if (!isNaN(days)) {
            const expiryDate = new Date(addDate);
            expiryDate.setDate(expiryDate.getDate() + days);
            this.ingredient.expiryDate = `${expiryDate.getFullYear()}-${String(expiryDate.getMonth() + 1).padStart(2, "0")}-${String(expiryDate.getDate()).padStart(2, "0")}`;
          }
        }
      },
      async saveIngredient() {
        if (!this.ingredient.name.trim()) {
          uni.showToast({
            title: "请输入食材名称",
            icon: "none"
          });
          return;
        }
        if (!this.ingredient.fridgeId || !this.ingredient.partitionId) {
          uni.showToast({
            title: "请选择存放位置",
            icon: "none"
          });
          return;
        }
        await dataManager.updateIngredient(this.ingredient);
        uni.showToast({
          title: "保存成功",
          icon: "success"
        });
        setTimeout(() => {
          uni.reLaunch({
            url: "/pages/index/index"
          });
        }, 1500);
      },
      goBack() {
        uni.reLaunch({
          url: "/pages/index/index"
        });
      },
      openCategoryModal() {
        this.showCategoryModal = true;
      },
      closeCategoryModal() {
        this.showCategoryModal = false;
        this.newCategory = "";
      },
      async addCategory() {
        if (!this.newCategory.trim()) {
          uni.showToast({
            title: "请输入标签名称",
            icon: "none"
          });
          return;
        }
        if (this.categories.includes(this.newCategory.trim())) {
          uni.showToast({
            title: "该标签已存在",
            icon: "none"
          });
          return;
        }
        await dataManager.addCategory(this.newCategory.trim());
        this.categories = await dataManager.getCategories();
        this.newCategory = "";
        uni.showToast({
          title: "添加成功",
          icon: "success"
        });
      },
      async deleteCategory(category, index) {
        await dataManager.deleteCategory(category);
        this.categories = await dataManager.getCategories();
        if (this.ingredient.type === category) {
          this.ingredient.type = "";
        }
        uni.showToast({
          title: "删除成功",
          icon: "success"
        });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "modal-container" }, [
      vue.createElementVNode("view", { class: "modal-card scale-in" }, [
        vue.createElementVNode("view", { class: "card-header" }, [
          vue.createElementVNode("text", { class: "card-title" }, "编辑食材"),
          vue.createElementVNode("view", {
            class: "close-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "close-icon" }, "×")
          ])
        ]),
        vue.createElementVNode("scroll-view", {
          class: "card-content",
          "scroll-y": ""
        }, [
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", {
              class: "image-upload",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.chooseImage && $options.chooseImage(...args))
            }, [
              $data.ingredient.imagePath ? (vue.openBlock(), vue.createElementBlock("image", {
                key: 0,
                src: $data.ingredient.imagePath,
                class: "uploaded-image",
                mode: "aspectFill"
              }, null, 8, ["src"])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "upload-placeholder"
              }, [
                vue.createElementVNode("text", { class: "upload-icon" }, "📷"),
                vue.createElementVNode("text", { class: "upload-text" }, "点击上传图片")
              ]))
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "📝"),
              vue.createElementVNode("text", null, "食材名称")
            ]),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.ingredient.name = $event),
                placeholder: "请输入食材名称",
                class: "form-input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.ingredient.name]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "🏷️"),
              vue.createElementVNode("text", null, "食材分类")
            ]),
            vue.createElementVNode("view", { class: "category-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.categories, (category) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: category,
                    class: vue.normalizeClass(["category-tag", { active: $data.ingredient.type === category }]),
                    onClick: ($event) => $options.selectCategory(category)
                  }, vue.toDisplayString(category), 11, ["onClick"]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "⚖️"),
              vue.createElementVNode("text", null, "分量（二选一）")
            ]),
            vue.createElementVNode("view", { class: "quantity-inputs" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "digit",
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.ingredient.quantityGram = $event),
                  placeholder: "多少克",
                  class: "quantity-input",
                  onInput: _cache[4] || (_cache[4] = (...args) => $options.onGramInput && $options.onGramInput(...args))
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ), [
                [vue.vModelText, $data.ingredient.quantityGram]
              ]),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "digit",
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.ingredient.quantityPortion = $event),
                  placeholder: "多少份",
                  class: "quantity-input",
                  onInput: _cache[6] || (_cache[6] = (...args) => $options.onPortionInput && $options.onPortionInput(...args))
                },
                null,
                544
                /* NEED_HYDRATION, NEED_PATCH */
              ), [
                [vue.vModelText, $data.ingredient.quantityPortion]
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "📍"),
              vue.createElementVNode("text", null, "存放位置")
            ]),
            vue.createElementVNode("view", { class: "location-cards" }, [
              vue.createElementVNode("view", { class: "location-card" }, [
                vue.createElementVNode("text", { class: "location-label" }, "冰箱"),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: $options.fridgeOptions,
                  value: $options.selectedFridgeIndex,
                  onChange: _cache[7] || (_cache[7] = (...args) => $options.onFridgeChange && $options.onFridgeChange(...args))
                }, [
                  vue.createElementVNode("view", { class: "picker-item" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "picker-value" },
                      vue.toDisplayString($options.selectedFridgeName),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "picker-arrow" }, "▼")
                  ])
                ], 40, ["range", "value"])
              ]),
              vue.createElementVNode("view", { class: "location-card" }, [
                vue.createElementVNode("text", { class: "location-label" }, "分区"),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: $options.partitionOptions,
                  value: $options.selectedPartitionIndex,
                  onChange: _cache[8] || (_cache[8] = (...args) => $options.onPartitionChange && $options.onPartitionChange(...args))
                }, [
                  vue.createElementVNode("view", { class: "picker-item" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "picker-value" },
                      vue.toDisplayString($options.selectedPartitionName),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "picker-arrow" }, "▼")
                  ])
                ], 40, ["range", "value"])
              ]),
              $options.currentPartitionLayers.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "location-card"
              }, [
                vue.createElementVNode("text", { class: "location-label" }, "层级"),
                vue.createElementVNode("picker", {
                  mode: "selector",
                  range: $options.layerOptions,
                  value: $options.selectedLayerIndex,
                  onChange: _cache[9] || (_cache[9] = (...args) => $options.onLayerChange && $options.onLayerChange(...args))
                }, [
                  vue.createElementVNode("view", { class: "picker-item" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "picker-value" },
                      vue.toDisplayString($options.selectedLayerName),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "picker-arrow" }, "▼")
                  ])
                ], 40, ["range", "value"])
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "📅"),
              vue.createElementVNode("text", null, "加入日期")
            ]),
            vue.createElementVNode("picker", {
              mode: "date",
              value: $data.ingredient.addDate,
              onChange: _cache[10] || (_cache[10] = (...args) => $options.onAddDateChange && $options.onAddDateChange(...args))
            }, [
              vue.createElementVNode("view", { class: "date-picker" }, [
                vue.createElementVNode(
                  "text",
                  { class: "date-text" },
                  vue.toDisplayString($data.ingredient.addDate),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "calendar-icon" }, "📅")
              ])
            ], 40, ["value"])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "⏱️"),
              vue.createElementVNode("text", null, "保鲜时间（天）")
            ]),
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "number",
                "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $data.freshDays = $event),
                placeholder: "请输入保鲜天数",
                class: "form-input",
                onInput: _cache[12] || (_cache[12] = (...args) => $options.calculateExpiryDate && $options.calculateExpiryDate(...args))
              },
              null,
              544
              /* NEED_HYDRATION, NEED_PATCH */
            ), [
              [vue.vModelText, $data.freshDays]
            ])
          ]),
          vue.createElementVNode("view", { class: "form-section" }, [
            vue.createElementVNode("view", { class: "section-title" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "⏰"),
              vue.createElementVNode("text", null, "保质期（到期日）")
            ]),
            vue.createElementVNode("picker", {
              mode: "date",
              value: $data.ingredient.expiryDate,
              onChange: _cache[13] || (_cache[13] = (...args) => $options.onExpiryDateChange && $options.onExpiryDateChange(...args))
            }, [
              vue.createElementVNode("view", { class: "date-picker" }, [
                vue.createElementVNode(
                  "text",
                  { class: "date-text" },
                  vue.toDisplayString($data.ingredient.expiryDate),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("text", { class: "calendar-icon" }, "📅")
              ])
            ], 40, ["value"])
          ]),
          vue.createElementVNode("view", {
            class: "save-btn",
            onClick: _cache[14] || (_cache[14] = (...args) => $options.saveIngredient && $options.saveIngredient(...args))
          }, [
            vue.createElementVNode("text", { class: "save-text" }, "保存")
          ])
        ])
      ])
    ]);
  }
  const PagesIngredientEdit = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-da3f4a66"], ["__file", "D:/Tare/food manager/pages/ingredient/edit.vue"]]);
  const _sfc_main$4 = {
    name: "SettingsPage",
    data() {
      return {};
    },
    methods: {
      goBack() {
        uni.navigateBack();
      },
      navigateToFridgeSettings() {
        uni.navigateTo({
          url: "/pages/settings/fridge"
        });
      },
      navigateToIngredientDetailSettings() {
        uni.navigateTo({
          url: "/pages/settings/ingredient-detail"
        });
      },
      navigateToCategoryManagement() {
        uni.navigateTo({
          url: "/pages/settings/category"
        });
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "modal-container" }, [
      vue.createElementVNode("view", { class: "modal-card scale-in" }, [
        vue.createElementVNode("view", { class: "card-header" }, [
          vue.createElementVNode("text", { class: "card-title" }, "设置"),
          vue.createElementVNode("view", {
            class: "close-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "close-icon" }, "×")
          ])
        ]),
        vue.createElementVNode("scroll-view", {
          class: "card-content",
          "scroll-y": ""
        }, [
          vue.createElementVNode("view", { class: "settings-cards" }, [
            vue.createElementVNode("view", {
              class: "setting-card",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.navigateToFridgeSettings && $options.navigateToFridgeSettings(...args))
            }, [
              vue.createElementVNode("view", { class: "setting-icon-wrapper" }, [
                vue.createElementVNode("text", { class: "setting-icon" }, "🧊")
              ]),
              vue.createElementVNode("view", { class: "setting-info" }, [
                vue.createElementVNode("text", { class: "setting-title" }, "冰箱设置"),
                vue.createElementVNode("text", { class: "setting-description" }, "管理冰箱、分区、位置标签等")
              ]),
              vue.createElementVNode("view", { class: "setting-arrow" }, [
                vue.createElementVNode("text", { class: "arrow-icon" }, "›")
              ])
            ]),
            vue.createElementVNode("view", {
              class: "setting-card",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.navigateToIngredientDetailSettings && $options.navigateToIngredientDetailSettings(...args))
            }, [
              vue.createElementVNode("view", { class: "setting-icon-wrapper" }, [
                vue.createElementVNode("text", { class: "setting-icon" }, "📋")
              ]),
              vue.createElementVNode("view", { class: "setting-info" }, [
                vue.createElementVNode("text", { class: "setting-title" }, "食材卡片设置"),
                vue.createElementVNode("text", { class: "setting-description" }, "可开关食材卡片中显示的各项字段")
              ]),
              vue.createElementVNode("view", { class: "setting-arrow" }, [
                vue.createElementVNode("text", { class: "arrow-icon" }, "›")
              ])
            ]),
            vue.createElementVNode("view", {
              class: "setting-card",
              onClick: _cache[3] || (_cache[3] = (...args) => $options.navigateToCategoryManagement && $options.navigateToCategoryManagement(...args))
            }, [
              vue.createElementVNode("view", { class: "setting-icon-wrapper" }, [
                vue.createElementVNode("text", { class: "setting-icon" }, "🏷️")
              ]),
              vue.createElementVNode("view", { class: "setting-info" }, [
                vue.createElementVNode("text", { class: "setting-title" }, "食材种类管理"),
                vue.createElementVNode("text", { class: "setting-description" }, "管理食材种类标签")
              ]),
              vue.createElementVNode("view", { class: "setting-arrow" }, [
                vue.createElementVNode("text", { class: "arrow-icon" }, "›")
              ])
            ])
          ])
        ])
      ])
    ]);
  }
  const PagesSettingsIndex = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-a11b3e9a"], ["__file", "D:/Tare/food manager/pages/settings/index.vue"]]);
  const _sfc_main$3 = {
    name: "FridgeSettingsPage",
    data() {
      return {
        fridges: [],
        partitions: [],
        // 冰箱编辑状态
        editingFridgeId: null,
        editingFridgeName: "",
        // 分区编辑状态
        editingPartitionId: null,
        editingPartitionField: "",
        // 'name' 或 'layers'
        editingPartitionName: "",
        editingPartitionLayers: 1,
        // 防止重复点击
        isAddingFridge: false,
        isAddingPartition: false,
        // 层数选项
        layerOptions: ["1层", "2层", "3层", "4层", "5层", "6层", "7层", "8层", "9层", "10层"]
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
          url: "/pages/index/index"
        });
      },
      getPartitionsByFridgeId(fridgeId) {
        return this.partitions.filter((p) => p.fridgeId === fridgeId);
      },
      // 冰箱操作
      async addFridge() {
        if (this.isAddingFridge)
          return;
        this.isAddingFridge = true;
        const defaultName = "新冰箱" + (this.fridges.length + 1);
        const fridge = {
          id: Date.now().toString(),
          name: defaultName
        };
        await dataManager.addFridge(fridge);
        this.fridges.push(fridge);
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
          uni.showToast({ title: "名称不能为空", icon: "none" });
          return;
        }
        const fridge = this.fridges.find((f) => f.id === fridgeId);
        if (fridge) {
          fridge.name = this.editingFridgeName.trim();
          await dataManager.updateFridge(fridge);
        }
        this.editingFridgeId = null;
      },
      async deleteFridge(fridgeId) {
        await dataManager.deleteFridge(fridgeId);
        this.fridges = this.fridges.filter((f) => f.id !== fridgeId);
        this.partitions = this.partitions.filter((p) => p.fridgeId !== fridgeId);
      },
      // 分区操作
      async addPartition(fridgeId) {
        if (this.isAddingPartition)
          return;
        this.isAddingPartition = true;
        const partitions = this.getPartitionsByFridgeId(fridgeId);
        const defaultName = "新分区" + (partitions.length + 1);
        const partition = {
          id: Date.now().toString(),
          name: defaultName,
          fridgeId,
          layers: [1]
        };
        await dataManager.addPartition(partition);
        this.partitions.push(partition);
        this.editingPartitionId = partition.id;
        this.editingPartitionField = "name";
        this.editingPartitionName = defaultName;
        setTimeout(() => {
          this.isAddingPartition = false;
        }, 500);
      },
      startEditPartitionName(partition) {
        this.editingPartitionId = partition.id;
        this.editingPartitionField = "name";
        this.editingPartitionName = partition.name;
      },
      async savePartitionName(partitionId) {
        if (!this.editingPartitionName.trim()) {
          uni.showToast({ title: "名称不能为空", icon: "none" });
          return;
        }
        const partition = this.partitions.find((p) => p.id === partitionId);
        if (partition) {
          partition.name = this.editingPartitionName.trim();
          await dataManager.updatePartition(partition);
        }
        this.editingPartitionId = null;
        this.editingPartitionField = "";
      },
      startEditPartitionLayers(partition) {
        this.editingPartitionId = partition.id;
        this.editingPartitionField = "layers";
        this.editingPartitionLayers = partition.layers.length;
      },
      onLayerChange(e) {
        this.editingPartitionLayers = parseInt(e.detail.value) + 1;
      },
      async savePartitionLayers(partitionId) {
        const layerCount = this.editingPartitionLayers;
        if (layerCount < 1 || layerCount > 10) {
          uni.showToast({ title: "层数需在1-10之间", icon: "none" });
          return;
        }
        const partition = this.partitions.find((p) => p.id === partitionId);
        if (partition) {
          partition.layers = Array.from({ length: layerCount }, (_, i) => i + 1);
          await dataManager.updatePartition(partition);
        }
        this.editingPartitionId = null;
        this.editingPartitionField = "";
      },
      async deletePartition(partitionId) {
        await dataManager.deletePartition(partitionId);
        this.partitions = this.partitions.filter((p) => p.id !== partitionId);
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "modal-container" }, [
      vue.createElementVNode("view", { class: "modal-card" }, [
        vue.createElementVNode("view", { class: "card-header" }, [
          vue.createElementVNode("text", { class: "card-title" }, "冰箱管理"),
          vue.createElementVNode("view", {
            class: "close-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "close-icon" }, "×")
          ])
        ]),
        vue.createElementVNode("scroll-view", {
          class: "card-content",
          "scroll-y": ""
        }, [
          vue.createElementVNode("view", { class: "create-section" }, [
            vue.createElementVNode("view", {
              class: "create-btn",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.addFridge && $options.addFridge(...args))
            }, [
              vue.createElementVNode("text", { class: "create-icon" }, "➕"),
              vue.createElementVNode("text", { class: "create-text" }, "创建冰箱")
            ])
          ]),
          vue.createElementVNode("view", { class: "fridge-list" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.fridges, (fridge) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: fridge.id,
                  class: "fridge-card"
                }, [
                  vue.createElementVNode("view", { class: "fridge-header" }, [
                    vue.createElementVNode("view", { class: "fridge-info" }, [
                      $data.editingFridgeId === fridge.id ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "name-edit"
                      }, [
                        vue.withDirectives(vue.createElementVNode(
                          "input",
                          {
                            type: "text",
                            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.editingFridgeName = $event),
                            class: "name-input",
                            focus: ""
                          },
                          null,
                          512
                          /* NEED_PATCH */
                        ), [
                          [vue.vModelText, $data.editingFridgeName]
                        ]),
                        vue.createElementVNode("text", {
                          class: "save-btn",
                          onClick: vue.withModifiers(($event) => $options.saveFridgeName(fridge.id), ["stop"])
                        }, "保存", 8, ["onClick"])
                      ])) : (vue.openBlock(), vue.createElementBlock("text", {
                        key: 1,
                        class: "fridge-name",
                        onClick: vue.withModifiers(($event) => $options.startEditFridgeName(fridge), ["stop"])
                      }, vue.toDisplayString(fridge.name), 9, ["onClick"])),
                      vue.createElementVNode(
                        "text",
                        { class: "fridge-stats" },
                        vue.toDisplayString($options.getPartitionsByFridgeId(fridge.id).length) + " 个分区",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "fridge-actions" }, [
                      vue.createElementVNode("text", {
                        class: "action-btn add",
                        onClick: vue.withModifiers(($event) => $options.addPartition(fridge.id), ["stop"])
                      }, "➕", 8, ["onClick"]),
                      vue.createElementVNode("text", {
                        class: "action-btn delete",
                        onClick: vue.withModifiers(($event) => $options.deleteFridge(fridge.id), ["stop"])
                      }, "🗑️", 8, ["onClick"])
                    ])
                  ]),
                  vue.createElementVNode("view", { class: "partition-list" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($options.getPartitionsByFridgeId(fridge.id), (partition) => {
                        return vue.openBlock(), vue.createElementBlock("view", {
                          key: partition.id,
                          class: "partition-item"
                        }, [
                          vue.createElementVNode("view", { class: "partition-info" }, [
                            $data.editingPartitionId === partition.id && $data.editingPartitionField === "name" ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 0,
                              class: "field-edit"
                            }, [
                              vue.withDirectives(vue.createElementVNode(
                                "input",
                                {
                                  type: "text",
                                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.editingPartitionName = $event),
                                  class: "field-input",
                                  focus: ""
                                },
                                null,
                                512
                                /* NEED_PATCH */
                              ), [
                                [vue.vModelText, $data.editingPartitionName]
                              ]),
                              vue.createElementVNode("text", {
                                class: "save-btn",
                                onClick: vue.withModifiers(($event) => $options.savePartitionName(partition.id), ["stop"])
                              }, "保存", 8, ["onClick"])
                            ])) : (vue.openBlock(), vue.createElementBlock("text", {
                              key: 1,
                              class: "partition-name",
                              onClick: vue.withModifiers(($event) => $options.startEditPartitionName(partition), ["stop"])
                            }, vue.toDisplayString(partition.name), 9, ["onClick"])),
                            $data.editingPartitionId === partition.id && $data.editingPartitionField === "layers" ? (vue.openBlock(), vue.createElementBlock("view", {
                              key: 2,
                              class: "field-edit"
                            }, [
                              vue.createElementVNode("text", { class: "field-label" }, "层数："),
                              vue.createElementVNode("picker", {
                                mode: "selector",
                                range: $data.layerOptions,
                                value: $data.editingPartitionLayers - 1,
                                onChange: _cache[4] || (_cache[4] = (...args) => $options.onLayerChange && $options.onLayerChange(...args))
                              }, [
                                vue.createElementVNode(
                                  "view",
                                  { class: "picker-value" },
                                  vue.toDisplayString($data.editingPartitionLayers) + "层",
                                  1
                                  /* TEXT */
                                )
                              ], 40, ["range", "value"]),
                              vue.createElementVNode("text", {
                                class: "save-btn",
                                onClick: vue.withModifiers(($event) => $options.savePartitionLayers(partition.id), ["stop"])
                              }, "保存", 8, ["onClick"])
                            ])) : (vue.openBlock(), vue.createElementBlock("view", {
                              key: 3,
                              class: "partition-layers",
                              onClick: vue.withModifiers(($event) => $options.startEditPartitionLayers(partition), ["stop"])
                            }, [
                              vue.createElementVNode(
                                "text",
                                { class: "layer-display" },
                                "层数：" + vue.toDisplayString(partition.layers.length) + "层",
                                1
                                /* TEXT */
                              )
                            ], 8, ["onClick"]))
                          ]),
                          vue.createElementVNode("text", {
                            class: "delete-btn",
                            onClick: vue.withModifiers(($event) => $options.deletePartition(partition.id), ["stop"])
                          }, "🗑️", 8, ["onClick"])
                        ]);
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])
    ]);
  }
  const PagesSettingsFridge = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-06f914de"], ["__file", "D:/Tare/food manager/pages/settings/fridge.vue"]]);
  const _sfc_main$2 = {
    name: "IngredientDetailSettingsPage",
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
        const savedSettings = dataManager.ingredientCardSettings;
        if (savedSettings) {
          if (savedSettings.showExpiryDate !== void 0) {
            savedSettings.showShelfLife = savedSettings.showExpiryDate;
            delete savedSettings.showExpiryDate;
          }
          this.settings = { ...this.settings, ...savedSettings };
        }
      },
      goBack() {
        uni.reLaunch({
          url: "/pages/index/index"
        });
      },
      toggleSetting(key) {
        this.settings[key] = !this.settings[key];
        dataManager.updateIngredientCardSettings(this.settings);
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "modal-container" }, [
      vue.createElementVNode("view", { class: "modal-card scale-in" }, [
        vue.createElementVNode("view", { class: "card-header" }, [
          vue.createElementVNode("text", { class: "card-title" }, "食材卡片设置"),
          vue.createElementVNode("view", {
            class: "close-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "close-icon" }, "×")
          ])
        ]),
        vue.createElementVNode("scroll-view", {
          class: "card-content",
          "scroll-y": ""
        }, [
          vue.createElementVNode("view", { class: "settings-description" }, [
            vue.createElementVNode("text", { class: "description-text" }, "选择在食材卡片中显示哪些信息字段")
          ]),
          vue.createElementVNode("view", { class: "settings-card" }, [
            vue.createElementVNode("view", { class: "setting-item" }, [
              vue.createElementVNode("view", { class: "setting-left" }, [
                vue.createElementVNode("view", { class: "setting-icon-wrapper" }, [
                  vue.createElementVNode("text", { class: "setting-icon" }, "🏷️")
                ]),
                vue.createElementVNode("text", { class: "setting-label" }, "显示食材种类")
              ]),
              vue.createElementVNode("view", {
                class: "checkbox-wrapper",
                onClick: _cache[1] || (_cache[1] = ($event) => $options.toggleSetting("showType"))
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["checkbox", { checked: $data.settings.showType }])
                  },
                  [
                    $data.settings.showType ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      class: "checkbox-icon"
                    }, "✓")) : vue.createCommentVNode("v-if", true)
                  ],
                  2
                  /* CLASS */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "setting-item" }, [
              vue.createElementVNode("view", { class: "setting-left" }, [
                vue.createElementVNode("view", { class: "setting-icon-wrapper" }, [
                  vue.createElementVNode("text", { class: "setting-icon" }, "⚖️")
                ]),
                vue.createElementVNode("text", { class: "setting-label" }, "显示分量")
              ]),
              vue.createElementVNode("view", {
                class: "checkbox-wrapper",
                onClick: _cache[2] || (_cache[2] = ($event) => $options.toggleSetting("showQuantity"))
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["checkbox", { checked: $data.settings.showQuantity }])
                  },
                  [
                    $data.settings.showQuantity ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      class: "checkbox-icon"
                    }, "✓")) : vue.createCommentVNode("v-if", true)
                  ],
                  2
                  /* CLASS */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "setting-item" }, [
              vue.createElementVNode("view", { class: "setting-left" }, [
                vue.createElementVNode("view", { class: "setting-icon-wrapper" }, [
                  vue.createElementVNode("text", { class: "setting-icon" }, "📍")
                ]),
                vue.createElementVNode("text", { class: "setting-label" }, "显示存放位置")
              ]),
              vue.createElementVNode("view", {
                class: "checkbox-wrapper",
                onClick: _cache[3] || (_cache[3] = ($event) => $options.toggleSetting("showLocation"))
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["checkbox", { checked: $data.settings.showLocation }])
                  },
                  [
                    $data.settings.showLocation ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      class: "checkbox-icon"
                    }, "✓")) : vue.createCommentVNode("v-if", true)
                  ],
                  2
                  /* CLASS */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "setting-item" }, [
              vue.createElementVNode("view", { class: "setting-left" }, [
                vue.createElementVNode("view", { class: "setting-icon-wrapper" }, [
                  vue.createElementVNode("text", { class: "setting-icon" }, "📅")
                ]),
                vue.createElementVNode("text", { class: "setting-label" }, "显示加入日期")
              ]),
              vue.createElementVNode("view", {
                class: "checkbox-wrapper",
                onClick: _cache[4] || (_cache[4] = ($event) => $options.toggleSetting("showAddDate"))
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["checkbox", { checked: $data.settings.showAddDate }])
                  },
                  [
                    $data.settings.showAddDate ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      class: "checkbox-icon"
                    }, "✓")) : vue.createCommentVNode("v-if", true)
                  ],
                  2
                  /* CLASS */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "setting-item" }, [
              vue.createElementVNode("view", { class: "setting-left" }, [
                vue.createElementVNode("view", { class: "setting-icon-wrapper" }, [
                  vue.createElementVNode("text", { class: "setting-icon" }, "⏰")
                ]),
                vue.createElementVNode("text", { class: "setting-label" }, "显示保质期")
              ]),
              vue.createElementVNode("view", {
                class: "checkbox-wrapper",
                onClick: _cache[5] || (_cache[5] = ($event) => $options.toggleSetting("showShelfLife"))
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["checkbox", { checked: $data.settings.showShelfLife }])
                  },
                  [
                    $data.settings.showShelfLife ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      class: "checkbox-icon"
                    }, "✓")) : vue.createCommentVNode("v-if", true)
                  ],
                  2
                  /* CLASS */
                )
              ])
            ]),
            vue.createElementVNode("view", { class: "setting-item" }, [
              vue.createElementVNode("view", { class: "setting-left" }, [
                vue.createElementVNode("view", { class: "setting-icon-wrapper" }, [
                  vue.createElementVNode("text", { class: "setting-icon" }, "🖼️")
                ]),
                vue.createElementVNode("text", { class: "setting-label" }, "显示图片")
              ]),
              vue.createElementVNode("view", {
                class: "checkbox-wrapper",
                onClick: _cache[6] || (_cache[6] = ($event) => $options.toggleSetting("showImage"))
              }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["checkbox", { checked: $data.settings.showImage }])
                  },
                  [
                    $data.settings.showImage ? (vue.openBlock(), vue.createElementBlock("text", {
                      key: 0,
                      class: "checkbox-icon"
                    }, "✓")) : vue.createCommentVNode("v-if", true)
                  ],
                  2
                  /* CLASS */
                )
              ])
            ])
          ])
        ])
      ])
    ]);
  }
  const PagesSettingsIngredientDetail = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-f4a117eb"], ["__file", "D:/Tare/food manager/pages/settings/ingredient-detail.vue"]]);
  const _sfc_main$1 = {
    name: "CategoryManagementPage",
    data() {
      return {
        categories: [],
        newCategory: ""
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
          url: "/pages/index/index"
        });
      },
      async addCategory() {
        if (!this.newCategory.trim()) {
          uni.showToast({
            title: "请输入标签名称",
            icon: "none"
          });
          return;
        }
        if (this.categories.includes(this.newCategory.trim())) {
          uni.showToast({
            title: "该标签已存在",
            icon: "none"
          });
          return;
        }
        await dataManager.addCategory(this.newCategory.trim());
        this.loadCategories();
        this.newCategory = "";
        uni.showToast({
          title: "添加成功",
          icon: "success"
        });
      },
      async deleteCategory(category, index) {
        await dataManager.deleteCategory(category);
        this.loadCategories();
        uni.showToast({
          title: "删除成功",
          icon: "success"
        });
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "modal-container" }, [
      vue.createElementVNode("view", { class: "modal-card scale-in" }, [
        vue.createElementVNode("view", { class: "card-header" }, [
          vue.createElementVNode("text", { class: "card-title" }, "食材种类管理"),
          vue.createElementVNode("view", {
            class: "close-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goBack && $options.goBack(...args))
          }, [
            vue.createElementVNode("text", { class: "close-icon" }, "×")
          ])
        ]),
        vue.createElementVNode("scroll-view", {
          class: "card-content",
          "scroll-y": ""
        }, [
          vue.createElementVNode("view", { class: "setting-card" }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "➕"),
              vue.createElementVNode("text", { class: "section-label" }, "添加新标签")
            ]),
            vue.createElementVNode("view", { class: "add-category-input" }, [
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  type: "text",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.newCategory = $event),
                  placeholder: "输入标签名称",
                  class: "category-input"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.newCategory]
              ]),
              vue.createElementVNode("view", {
                class: "add-category-btn",
                onClick: _cache[2] || (_cache[2] = (...args) => $options.addCategory && $options.addCategory(...args))
              }, [
                vue.createElementVNode("text", { class: "btn-text" }, "添加")
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "setting-card" }, [
            vue.createElementVNode("view", { class: "section-header" }, [
              vue.createElementVNode("text", { class: "section-icon" }, "🏷️"),
              vue.createElementVNode("text", { class: "section-label" }, "已添加的标签")
            ]),
            vue.createElementVNode("view", { class: "category-tags-container" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.categories, (category, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    key: category,
                    class: "category-tag-item"
                  }, [
                    vue.createElementVNode(
                      "text",
                      { class: "tag-name" },
                      vue.toDisplayString(category),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("view", {
                      class: "tag-delete-btn",
                      onClick: ($event) => $options.deleteCategory(category, index)
                    }, [
                      vue.createElementVNode("text", { class: "delete-icon" }, "×")
                    ], 8, ["onClick"])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              $data.categories.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "empty-state"
              }, [
                vue.createElementVNode("text", { class: "empty-text" }, "暂无标签，请添加")
              ])) : vue.createCommentVNode("v-if", true)
            ])
          ])
        ])
      ])
    ]);
  }
  const PagesSettingsCategory = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-e25fee7e"], ["__file", "D:/Tare/food manager/pages/settings/category.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/ingredient/add", PagesIngredientAdd);
  __definePage("pages/ingredient/detail", PagesIngredientDetail);
  __definePage("pages/ingredient/edit", PagesIngredientEdit);
  __definePage("pages/settings/index", PagesSettingsIndex);
  __definePage("pages/settings/fridge", PagesSettingsFridge);
  __definePage("pages/settings/ingredient-detail", PagesSettingsIngredientDetail);
  __definePage("pages/settings/category", PagesSettingsCategory);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/Tare/food manager/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
