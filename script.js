// 家庭成长乐园 - 主游戏逻辑

class FamilyGrowthGame {
    constructor() {
        this.gameState = {
            coins: 0,
            hearts: 5,
            treeLevel: 1,
            treeProgress: 0,
            currentTasks: [],
            completedTasks: [],
            achievements: [],
            familyMembers: [],
            lastLoginDate: null,
            consecutiveDays: 0,
            studyGoals: [],
            readingList: [],
            homeworkRecords: [],
            customBooks: [],
            photoSubmissions: [],
            studyStreak: 0,
            totalStudyTime: 0,
            weeklyStats: {}
        };

        // 性能优化相关
        this.debounceTimers = {};
        this.isProcessing = false;
        this.loadingStates = new Set();

        this.tasks = [
            { id: 1, title: "帮妈妈洗碗", description: "主动帮助洗碗，培养劳动习惯", points: 10, category: "家务", difficulty: "简单" },
            { id: 2, title: "独立整理书包", description: "自己整理第二天要用的书包", points: 15, category: "学习", difficulty: "简单" },
            { id: 3, title: "和爸爸一起阅读", description: "与爸爸一起阅读30分钟", points: 20, category: "亲子", difficulty: "中等" },
            { id: 4, title: "收拾自己的房间", description: "整理房间，保持整洁", points: 25, category: "家务", difficulty: "中等" },
            { id: 5, title: "给家人讲故事", description: "准备一个故事讲给家人听", points: 30, category: "表达", difficulty: "中等" },
            { id: 6, title: "学习新知识", description: "学习一个新的知识点或技能", points: 35, category: "学习", difficulty: "困难" },
            { id: 7, title: "制作手工礼物", description: "为家人制作一份手工礼物", points: 40, category: "创意", difficulty: "困难" },
            { id: 8, title: "照顾植物或宠物", description: "照顾家里的植物或宠物", points: 25, category: "责任", difficulty: "中等" },
            { id: 9, title: "整理书桌", description: "整理自己的书桌和学习用品", points: 15, category: "生活技能", difficulty: "简单" },
            { id: 10, title: "垃圾分类", description: "学习并实践垃圾分类", points: 20, category: "生活技能", difficulty: "中等" },
            { id: 11, title: "制作简单早餐", description: "独立制作简单的早餐", points: 30, category: "生活技能", difficulty: "中等" },
            { id: 12, title: "打扫卫生", description: "参与家庭清洁工作", points: 20, category: "家务", difficulty: "中等" },
            { id: 13, title: "整理衣柜", description: "整理自己的衣物", points: 18, category: "生活技能", difficulty: "简单" },
            { id: 14, title: "学习理财", description: "记录一周的零花钱使用情况", points: 25, category: "生活技能", difficulty: "中等" },
            { id: 15, title: "安全知识学习", description: "学习家庭安全知识", points: 22, category: "生活技能", difficulty: "简单" }
        ];

        this.achievements = [
            { id: 1, name: "初次尝试", description: "完成第一个任务", icon: "🌟", condition: "tasksCompleted", value: 1, unlocked: false },
            { id: 2, name: "家务小能手", description: "完成5个家务任务", icon: "🧹", condition: "categoryTasks", category: "家务", value: 5, unlocked: false },
            { id: 3, name: "学习达人", description: "完成7个学习任务", icon: "📚", condition: "categoryTasks", category: "学习", value: 7, unlocked: false },
            { id: 4, name: "亲子时光", description: "完成10个亲子任务", icon: "👨‍👩‍👧‍👦", condition: "categoryTasks", category: "亲子", value: 10, unlocked: false },
            { id: 5, name: "持之以恒", description: "连续7天登录游戏", icon: "📅", condition: "consecutiveDays", value: 7, unlocked: false },
            { id: 6, name: "成长树苗", description: "成长树达到3级", icon: "🌱", condition: "treeLevel", value: 3, unlocked: false },
            { id: 7, name: "爱心家庭", description: "获得100颗爱心", icon: "❤️", condition: "heartsCollected", value: 100, unlocked: false },
            { id: 8, name: "财富积累", description: "获得500金币", icon: "💰", condition: "coinsCollected", value: 500, unlocked: false },
            { id: 9, name: "生活技能专家", description: "完成8个生活技能任务", icon: "🏠", condition: "categoryTasks", category: "生活技能", value: 8, unlocked: false },
            { id: 10, name: "专注大师", description: "累计专注学习100分钟", icon: "🎯", condition: "totalFocusTime", value: 100, unlocked: false },
            { id: 11, name: "品德之星", description: "完成20个品德挑战", icon: "⭐", condition: "moralLessons", value: 20, unlocked: false },
            { id: 12, name: "超级坚持者", description: "连续30天登录游戏", icon: "🔥", condition: "consecutiveDays", value: 30, unlocked: false }
        ];

        this.init();
    }

    init() {
        this.loadGameState();
        this.setupEventListeners();
        this.updateUI();
        this.checkDailyReset();
        this.generateDailyTasks();
        this.showWelcomeMessage();
    }

    // 防抖处理函数
    debounce(func, delay, key) {
        if (this.debounceTimers[key]) {
            clearTimeout(this.debounceTimers[key]);
        }
        this.debounceTimers[key] = setTimeout(() => {
            func();
            delete this.debounceTimers[key];
        }, delay);
    }

    // 显示加载状态
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            this.loadingStates.add(elementId);
            element.classList.add('opacity-50', 'pointer-events-none');
        }
    }

    // 隐藏加载状态
    hideLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            this.loadingStates.delete(elementId);
            element.classList.remove('opacity-50', 'pointer-events-none');
        }
    }

    // 安全的异步操作包装器
    async safeAsyncOperation(operation, loadingElementId = null) {
        if (this.isProcessing) return;

        try {
            this.isProcessing = true;
            if (loadingElementId) {
                this.showLoading(loadingElementId);
            }

            const result = await operation();
            return result;
        } catch (error) {
            console.error('操作失败:', error);
            this.showNotification('操作失败，请稍后重试', 'error');
            return null;
        } finally {
            this.isProcessing = false;
            if (loadingElementId) {
                this.hideLoading(loadingElementId);
            }
        }
    }

    setupEventListeners() {
        document.getElementById('menuBtn').addEventListener('click', () => this.toggleMenu());
        document.getElementById('contentModal').addEventListener('click', (e) => {
            if (e.target.id === 'contentModal') this.closeModal();
        });

        // 添加触摸反馈
        this.addTouchFeedback();

        // 添加移动端手势支持
        this.addGestureSupport();

        // 添加键盘导航支持
        this.addKeyboardNavigation();

        // 添加离线检测
        this.addOfflineSupport();
    }

  addGestureSupport() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            // 检测水平滑动
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > swipeThreshold) {
                    // 向右滑动 - 打开菜单
                    this.handleSwipeRight();
                } else if (diffX < -swipeThreshold) {
                    // 向左滑动 - 关闭菜单
                    this.handleSwipeLeft();
                }
            }
        };

        this.handleSwipe = handleSwipe.bind(this);
    }

  handleSwipeRight() {
        const menu = document.getElementById('sideMenu');
        if (menu && menu.classList.contains('hidden')) {
            this.toggleMenu();
        }
    }

  handleSwipeLeft() {
        const menu = document.getElementById('sideMenu');
        if (menu && !menu.classList.contains('hidden')) {
            this.toggleMenu();
        }
    }

  addKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Escape':
                    if (!document.getElementById('contentModal').classList.contains('hidden')) {
                        this.closeModal();
                    }
                    if (!document.getElementById('sideMenu').classList.contains('hidden')) {
                        this.toggleMenu();
                    }
                    break;
                case 'Enter':
                    if (e.target.classList.contains('task-card')) {
                        e.target.click();
                    }
                    break;
            }
        });
    }

  addOfflineSupport() {
        window.addEventListener('online', () => {
            this.showNotification('网络连接已恢复', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('网络连接已断开，数据将在本地保存', 'warning');
        });
    }

    addTouchFeedback() {
        const touchElements = document.querySelectorAll('.task-card, .btn-primary, .btn-secondary, [onclick]');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-feedback', 'active');
            }, { passive: true });

            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touch-feedback', 'active');
                }, 300);
            }, { passive: true });
        });
    }

    toggleMenu() {
        const menu = document.getElementById('sideMenu');
        const panel = document.getElementById('menuPanel');

        if (menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            setTimeout(() => {
                panel.classList.remove('menu-panel-closed');
                panel.classList.add('menu-panel-open');
            }, 10);
        } else {
            panel.classList.remove('menu-panel-open');
            panel.classList.add('menu-panel-closed');
            setTimeout(() => {
                menu.classList.add('hidden');
            }, 300);
        }
    }

    showSection(sectionName) {
        if (sectionName !== 'dailyTasks' && sectionName !== 'character' && sectionName !== 'study' && sectionName !== 'lifeSkills') {
            this.toggleMenu();
        }
        this.closeModal();

        switch(sectionName) {
            case 'dailyTasks':
                this.showDailyTasks();
                break;
            case 'character':
                this.showCharacterEducation();
                break;
            case 'study':
                this.showStudyHabits();
                break;
            case 'lifeSkills':
                this.showLifeSkills();
                break;
            case 'parent':
                this.showParentCenter();
                break;
            case 'profile':
                this.showProfile();
                break;
            case 'achievements':
                this.showAchievements();
                break;
            case 'family':
                this.showFamilyMembers();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
    }

    showLifeSkills() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '生活技能';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">🏠</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">生活技能培养</h3>
                    <p class="text-gray-600">通过游戏学习实用生活技能</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.startLifeSkillLesson('room')">
                        <div class="text-3xl mb-2">🛏️</div>
                        <h4 class="font-semibold text-gray-800">整理房间</h4>
                        <p class="text-xs text-gray-600 mt-1">学习收纳技巧</p>
                    </div>

                    <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.startLifeSkillLesson('cooking')">
                        <div class="text-3xl mb-2">🍳</div>
                        <h4 class="font-semibold text-gray-800">简单烹饪</h4>
                        <p class="text-xs text-gray-600 mt-1">制作简单美食</p>
                    </div>

                    <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.startLifeSkillLesson('safety')">
                        <div class="text-3xl mb-2">🛡️</div>
                        <h4 class="font-semibold text-gray-800">安全知识</h4>
                        <p class="text-xs text-gray-600 mt-1">学习安全常识</p>
                    </div>

                    <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.startLifeSkillLesson('finance')">
                        <div class="text-3xl mb-2">💰</div>
                        <h4 class="font-semibold text-gray-800">理财基础</h4>
                        <p class="text-xs text-gray-600 mt-1">认识金钱价值</p>
                    </div>
                </div>

                <div class="bg-yellow-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-yellow-800 mb-2">
                        <i class="fas fa-lightbulb mr-2"></i>今日生活挑战
                    </h4>
                    <p class="text-sm text-yellow-700">挑战：今天尝试自己整理书桌，拍照上传可获得额外奖励！</p>
                    <button class="mt-3 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors" onclick="game.uploadLifeSkillPhoto()">
                        上传照片
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

    startLifeSkillLesson(skillType) {
        const lessons = {
            room: {
                title: "整理房间",
                steps: [
                    "将物品分类：书籍、衣物、玩具等",
                    "清洁表面灰尘",
                    "按类别整理收纳",
                    "保持整洁习惯"
                ],
                tips: "每天花10分钟整理，房间会始终保持整洁！"
            },
            cooking: {
                title: "简单烹饪",
                steps: [
                    "学会使用基础厨具",
                    "制作简单早餐（如煮鸡蛋、热牛奶）",
                    "清洗食材和餐具",
                    "注意安全操作"
                ],
                tips: "从简单的开始，逐步提升烹饪技能！"
            },
            safety: {
                title: "安全知识",
                steps: [
                    "认识家庭安全隐患",
                    "学会正确使用电器",
                    "掌握紧急情况应对方法",
                    "记住重要联系电话"
                ],
                tips: "安全第一，预防为主！"
            },
            finance: {
                title: "理财基础",
                steps: [
                    "认识不同面值的货币",
                    "学会记账和预算",
                    "理解储蓄的重要性",
                    "合理消费不浪费"
                ],
                tips: "从小培养理财意识，受益终生！"
            }
        };

        const lesson = lessons[skillType];
        this.showLifeSkillSteps(lesson);
    }

    showLifeSkillSteps(lesson) {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = lesson.title;
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="bg-blue-50 p-6 rounded-xl">
                    <h3 class="font-semibold text-gray-800 mb-3">学习步骤</h3>
                    <ol class="space-y-3">
                        ${lesson.steps.map((step, index) => `
                            <li class="flex items-start">
                                <span class="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-2">${index + 1}</span>
                                <span class="text-gray-700">${step}</span>
                            </li>
                        `).join('')}
                    </ol>
                </div>

                <div class="bg-green-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-green-800 mb-2">
                        <i class="fas fa-star mr-2"></i>小贴士
                    </h4>
                    <p class="text-sm text-green-700">${lesson.tips}</p>
                </div>

                <div class="flex space-x-3">
                    <button onclick="game.completeLifeSkillLesson()" class="btn-primary flex-1">
                        完成学习
                    </button>
                </div>
            </div>
        `;
    }

    completeLifeSkillLesson() {
        this.gameState.coins += 25;
        this.gameState.treeProgress += 12;

        // 记录生活技能完成数量
        this.gameState.lifeSkillsCompleted = (this.gameState.lifeSkillsCompleted || 0) + 1;

        this.updateUI();
        this.updateGrowthTree();
        this.saveGameState();

        // 检查成就
        this.checkAchievements();

        this.showNotification('生活技能学习完成！获得25金币', 'success');
        this.closeModal();
    }

    uploadLifeSkillPhoto() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '上传生活技能照片';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">📸</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">分享你的成就</h3>
                    <p class="text-gray-600">上传照片记录你的成长时刻</p>
                </div>

                <div class="bg-blue-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-blue-800 mb-3">拍摄要求</h4>
                    <ul class="text-sm text-blue-700 space-y-1">
                        <li>• 照片清晰，能看到完成的任务</li>
                        <li>• 确保照片中的人物表情自然</li>
                        <li>• 背景整洁，突出主题</li>
                        <li>• 仅上传本人或家庭成员的照片</li>
                    </ul>
                </div>

                <div class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input type="file" id="photoInput" accept="image/*" capture="camera" style="display: none;" onchange="game.handlePhotoSelect(event)">
                    <div id="photoPreview" class="mb-4"></div>

                    <div id="uploadPrompt" class="space-y-3">
                        <div class="text-4xl mb-2">📷</div>
                        <p class="text-gray-600">点击下方按钮选择或拍摄照片</p>
                    </div>

                    <div class="flex flex-col space-y-3">
                        <button onclick="document.getElementById('photoInput').click()"
                                class="btn-primary">
                            <i class="fas fa-camera mr-2"></i>拍摄照片
                        </button>
                        <button onclick="document.getElementById('photoInput').click()"
                                class="btn-secondary">
                            <i class="fas fa-image mr-2"></i>选择照片
                        </button>
                    </div>
                </div>

                <div class="bg-yellow-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-yellow-800 mb-2">
                        <i class="fas fa-gift mr-2"></i>上传奖励
                    </h4>
                    <p class="text-sm text-yellow-700">成功上传照片并通过审核后，将获得额外30金币奖励！</p>
                </div>

                <div class="flex space-x-3">
                    <button onclick="game.closeModal()" class="btn-secondary flex-1">
                        取消
                    </button>
                    <button id="submitPhotoBtn" onclick="game.submitPhoto()"
                            class="btn-primary flex-1" disabled style="opacity: 0.5; cursor: not-allowed;">
                        提交照片
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

  handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 检查文件大小（限制为5MB）
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('照片文件过大，请选择小于5MB的照片', 'error');
            return;
        }

        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            this.showNotification('请选择有效的图片文件', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const photoPreview = document.getElementById('photoPreview');
            photoPreview.innerHTML = `
                <img src="${e.target.result}" alt="预览" class="max-w-full max-h-64 mx-auto rounded-lg shadow-md">
                <div class="mt-2 text-sm text-gray-600">已选择照片：${file.name}</div>
            `;

            // 隐藏上传提示，启用提交按钮
            document.getElementById('uploadPrompt').style.display = 'none';
            const submitBtn = document.getElementById('submitPhotoBtn');
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';

            // 保存照片数据
            this.selectedPhoto = {
                data: e.target.result,
                name: file.name,
                size: file.size,
                type: file.type,
                uploadDate: new Date().toISOString()
            };
        };

        reader.readAsDataURL(file);
    }

  submitPhoto() {
        if (!this.selectedPhoto) {
            this.showNotification('请先选择照片', 'warning');
            return;
        }

        // 模拟上传过程
        const submitBtn = document.getElementById('submitPhotoBtn');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>上传中...';
        submitBtn.disabled = true;

        // 保存照片记录到游戏状态
        if (!this.gameState.photoSubmissions) {
            this.gameState.photoSubmissions = [];
        }

        const submission = {
            id: Date.now().toString(),
            ...this.selectedPhoto,
            status: 'pending', // pending, approved, rejected
            submissionDate: new Date().toISOString(),
            coins: 30 // 预期奖励
        };

        this.gameState.photoSubmissions.push(submission);
        this.saveGameState();

        // 模拟审核过程（2秒后通过）
        setTimeout(() => {
            submission.status = 'approved';
            submission.reviewDate = new Date().toISOString();

            // 给予奖励
            this.gameState.coins += submission.coins;
            this.gameState.treeProgress += 15;

            this.updateUI();
            this.updateGrowthTree();
            this.saveGameState();

            this.closeModal();
            this.showNotification(`照片上传成功！获得${submission.coins}金币奖励`, 'success');

            // 重置状态
            this.selectedPhoto = null;
        }, 2000);
    }

    showDailyTasks() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '每日任务';
        modalContent.innerHTML = `
            <div class="space-y-4">
                <div class="bg-blue-50 p-4 rounded-xl">
                    <p class="text-sm text-blue-800 mb-2">今日任务目标：完成至少3个任务</p>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-blue-600">已完成：${this.gameState.completedTasks.filter(t => this.isToday(t.completedDate)).length}</span>
                        <span class="text-sm text-blue-600">待完成：${this.gameState.currentTasks.length}</span>
                    </div>
                </div>

                <div class="space-y-3">
                    ${this.generateTaskHTML()}
                </div>

                <div class="mt-6 text-center">
                    <button onclick="game.refreshTasks()" class="btn-secondary mr-2">
                        <i class="fas fa-sync-alt mr-2"></i>刷新任务
                    </button>
                    <button onclick="game.showTaskSuggestions()" class="btn-primary">
                        <i class="fas fa-lightbulb mr-2"></i>任务建议
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

    generateTaskHTML() {
        if (this.gameState.currentTasks.length === 0) {
            return '<p class="text-gray-500 text-center py-8">暂无任务，点击"刷新任务"获取新任务</p>';
        }

        return this.gameState.currentTasks.map(task => {
            const taskData = this.tasks.find(t => t.id === task.id);
            const isCompleted = task.completed;
            const difficultyColor = {
                '简单': 'bg-green-100 text-green-800',
                '中等': 'bg-yellow-100 text-yellow-800',
                '困难': 'bg-red-100 text-red-800'
            }[taskData.difficulty];

            return `
                <div class="task-card ${isCompleted ? 'completed' : ''}" onclick="game.toggleTask(${task.id})">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <input type="checkbox" ${isCompleted ? 'checked' : ''}
                                       class="mr-3 w-5 h-5 text-blue-600 rounded"
                                       onclick="event.stopPropagation()">
                                <h4 class="font-semibold text-gray-800 ${isCompleted ? 'line-through' : ''}">${taskData.title}</h4>
                            </div>
                            <p class="text-sm text-gray-600 mb-2">${taskData.description}</p>
                            <div class="flex items-center space-x-2">
                                <span class="text-xs px-2 py-1 rounded-full ${difficultyColor}">${taskData.difficulty}</span>
                                <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">${taskData.category}</span>
                                <span class="text-xs text-orange-600 font-semibold">
                                    <i class="fas fa-coins mr-1"></i>${taskData.points}
                                </span>
                            </div>
                        </div>
                        ${isCompleted ? '<i class="fas fa-check-circle text-green-500 text-xl ml-3"></i>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleTask(taskId) {
        const task = this.gameState.currentTasks.find(t => t.id === taskId);
        if (!task) return;

        task.completed = !task.completed;

        if (task.completed && !task.claimed) {
            const taskData = this.tasks.find(t => t.id === taskId);
            this.gameState.coins += taskData.points;
            this.gameState.treeProgress += 10;
            task.claimed = true;
            task.completedDate = new Date().toISOString();

            this.gameState.completedTasks.push({
                id: taskId,
                completedDate: task.completedDate
            });

            this.showNotification(`任务完成！获得 ${taskData.points} 金币`, 'success');
            this.checkAchievements();
            this.updateGrowthTree();
        } else if (!task.completed) {
            const taskData = this.tasks.find(t => t.id === taskId);
            this.gameState.coins -= taskData.points;
            this.gameState.treeProgress -= 10;
            task.claimed = false;
            delete task.completedDate;

            const completedIndex = this.gameState.completedTasks.findIndex(t => t.id === taskId);
            if (completedIndex !== -1) {
                this.gameState.completedTasks.splice(completedIndex, 1);
            }
        }

        this.updateUI();
        this.saveGameState();
        this.showDailyTasks(); // 刷新任务显示
    }

    showCharacterEducation() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '品德培养';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">🌟</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">培养良好品德</h3>
                    <p class="text-gray-600">通过情景学习，培养孩子的优秀品德</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.startMoralLesson('honest')">
                        <div class="text-3xl mb-2">🎯</div>
                        <h4 class="font-semibold text-gray-800">诚实守信</h4>
                        <p class="text-xs text-gray-600 mt-1">学习诚实的重要性</p>
                    </div>

                    <div class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.startMoralLesson('kindness')">
                        <div class="text-3xl mb-2">💝</div>
                        <h4 class="font-semibold text-gray-800">友善待人</h4>
                        <p class="text-xs text-gray-600 mt-1">培养友善的品质</p>
                    </div>

                    <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.startMoralLesson('responsibility')">
                        <div class="text-3xl mb-2">🎖️</div>
                        <h4 class="font-semibold text-gray-800">责任担当</h4>
                        <p class="text-xs text-gray-600 mt-1">学会承担责任</p>
                    </div>

                    <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.startMoralLesson('respect')">
                        <div class="text-3xl mb-2">🤝</div>
                        <h4 class="font-semibold text-gray-800">尊重他人</h4>
                        <p class="text-xs text-gray-600 mt-1">学会尊重与理解</p>
                    </div>
                </div>

                <div class="bg-yellow-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-yellow-800 mb-2">
                        <i class="fas fa-lightbulb mr-2"></i>今日品德话题
                    </h4>
                    <p class="text-sm text-yellow-700">分享：什么是真正的朋友？如何成为一个好朋友？</p>
                    <button class="mt-3 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-colors" onclick="game.startFamilyDiscussion()">
                        开始家庭讨论
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

    startMoralLesson(lessonType) {
        const lessons = {
            honest: {
                title: "诚实守信",
                scenario: "小明不小心打碎了妈妈最喜欢的花瓶，妈妈回来问是谁做的。小明应该怎么做？",
                options: [
                    { text: "承认错误并道歉", value: "honest", points: 20 },
                    { text: "说是小猫打碎的", value: "lie", points: 0 },
                    { text: "不说话，默认不知道", value: "silent", points: 5 }
                ],
                lesson: "诚实是一种美德，即使做错了事，勇于承认也是值得称赞的。"
            },
            kindness: {
                title: "友善待人",
                scenario: "新同学小红来到班级，她看起来很紧张，你应该怎么做？",
                options: [
                    { text: "主动和她打招呼，介绍班级情况", value: "friendly", points: 20 },
                    { text: "等她主动来找自己", value: "passive", points: 5 },
                    { text: "觉得新同学很奇怪，不接近她", value: "unfriendly", points: 0 }
                ],
                lesson: "友善和包容能让新朋友感到温暖，帮助别人是一件快乐的事情。"
            },
            responsibility: {
                title: "责任担当",
                scenario: "今天轮到你值日打扫教室，但是放学后朋友们约你去玩，你应该？",
                options: [
                    { text: "先完成值日工作再去玩", value: "responsible", points: 20 },
                    { text: "随便打扫一下就走了", value: "careless", points: 5 },
                    { text: "不管值日直接去玩", value: "irresponsible", points: 0 }
                ],
                lesson: "responsibility是一种重要的品质，认真完成自己的责任是成长的表现。"
            },
            respect: {
                title: "尊重他人",
                scenario: "爷爷在讲他年轻时的故事，你已经听过很多遍了，你应该？",
                options: [
                    { text: "认真倾听，适当提问", value: "respectful", points: 20 },
                    { text: "心不在焉地听着", value: "distracted", points: 5 },
                    { text: "打断爷爷说听过了", value: "rude", points: 0 }
                ],
                lesson: "尊重长辈，耐心倾听他们的故事，这是中华民族的传统美德。"
            }
        };

        const lesson = lessons[lessonType];
        this.showMoralScenario(lesson);
    }

    showMoralScenario(lesson) {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = lesson.title;
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="bg-blue-50 p-6 rounded-xl">
                    <h3 class="font-semibold text-gray-800 mb-3">情景模拟</h3>
                    <p class="text-gray-700 leading-relaxed">${lesson.scenario}</p>
                </div>

                <div class="space-y-3">
                    <h4 class="font-semibold text-gray-800">请选择你的做法：</h4>
                    ${lesson.options.map((option, index) => `
                        <button onclick="game.selectMoralOption('${lesson.title}', '${option.value}', ${option.points})"
                                class="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-800">${option.text}</span>
                                <span class="text-sm text-blue-600 font-semibold">+${option.points} 分</span>
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    selectMoralOption(lessonTitle, optionValue, points) {
        if (points > 0) {
            this.gameState.coins += points;
            this.gameState.treeProgress += 5;

            // 记录品德课程完成数量
            this.gameState.moralLessonsCompleted = (this.gameState.moralLessonsCompleted || 0) + 1;

            this.showNotification(`做得好！获得 ${points} 金币`, 'success');

            // 检查成就
            this.checkAchievements();
        } else {
            this.showNotification('再想想看，可能有更好的选择', 'warning');
        }

        this.updateUI();
        this.updateGrowthTree();
        this.saveGameState();

        // 显示课程总结
        setTimeout(() => {
            this.showMoralLessonSummary(lessonTitle, optionValue, points);
        }, 1500);
    }

    showMoralLessonSummary(lessonTitle, optionValue, points) {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        const isGoodChoice = points > 0;

        modalTitle.textContent = "课程总结";
        modalContent.innerHTML = `
            <div class="text-center space-y-4">
                <div class="text-6xl mb-4">${isGoodChoice ? '🎉' : '💭'}</div>
                <h3 class="text-xl font-bold text-gray-800">${isGoodChoice ? '做得很好！' : '继续努力！'}</h3>
                <p class="text-gray-600">
                    ${isGoodChoice ?
                      '你的选择体现了良好的品德品质，继续保持！' :
                      '这次的选择可能不是最好的，但每次思考都是成长的机会。'}
                </p>

                <div class="bg-blue-50 p-4 rounded-xl mt-6">
                    <h4 class="font-semibold text-blue-800 mb-2">家庭讨论话题</h4>
                    <p class="text-sm text-blue-700">和爸爸妈妈讨论一下：为什么诚实/友善/负责/尊重很重要？</p>
                </div>

                <div class="flex space-x-3">
                    <button onclick="game.closeModal()" class="btn-secondary flex-1">
                        关闭
                    </button>
                    <button onclick="game.showCharacterEducation()" class="btn-primary flex-1">
                        继续学习
                    </button>
                </div>
            </div>
        `;
    }

    showStudyHabits() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '学习习惯';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">📚</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">培养良好学习习惯</h3>
                    <p class="text-gray-600">通过有趣的游戏，养成好习惯</p>
                </div>

                <div class="space-y-4">
                    <div class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-semibold text-gray-800">
                                <i class="fas fa-clock mr-2 text-green-600"></i>时间管理
                            </h4>
                            <span class="text-sm text-green-600 font-semibold">今日目标：30分钟</span>
                        </div>
                        <div class="bg-white rounded-lg p-3">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm text-gray-600">专注学习时间</span>
                                <span class="text-sm font-semibold">15分钟</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-green-500 h-2 rounded-full" style="width: 50%"></div>
                            </div>
                        </div>
                        <button onclick="game.startTimerGame()" class="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition-colors w-full">
                            开始专注挑战
                        </button>
                    </div>

                    <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-semibold text-gray-800">
                                <i class="fas fa-bookmark mr-2 text-blue-600"></i>阅读计划
                            </h4>
                            <span class="text-sm text-blue-600 font-semibold">本周目标：3本书</span>
                        </div>
                        <div class="bg-white rounded-lg p-3">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm text-gray-600">已读书籍</span>
                                <span class="text-sm font-semibold">${this.gameState.readingList?.filter(book => book.completed).length || 0}本</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(((this.gameState.readingList?.filter(book => book.completed).length || 0) / 3) * 100, 100)}%"></div>
                            </div>
                        </div>
                        <button onclick="game.showReadingList()" class="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors w-full">
                            查看书单
                        </button>
                    </div>

                    <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                        <div class="flex items-center justify-between mb-3">
                            <h4 class="font-semibold text-gray-800">
                                <i class="fas fa-pencil-alt mr-2 text-purple-600"></i>作业习惯
                            </h4>
                            <span class="text-sm text-purple-600 font-semibold">连续完成：5天</span>
                        </div>
                        <div class="bg-white rounded-lg p-3">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm text-gray-600">作业质量</span>
                                <div class="flex">
                                    <i class="fas fa-star text-yellow-400 text-xs"></i>
                                    <i class="fas fa-star text-yellow-400 text-xs"></i>
                                    <i class="fas fa-star text-yellow-400 text-xs"></i>
                                    <i class="fas fa-star text-yellow-400 text-xs"></i>
                                    <i class="far fa-star text-gray-300 text-xs"></i>
                                </div>
                            </div>
                        </div>
                        <button onclick="game.showHomeworkTips()" class="mt-3 bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition-colors w-full">
                            作业技巧
                        </button>
                    </div>
                </div>

                <div class="text-center">
                    <button onclick="game.showStudyProgress()" class="btn-primary">
                        <i class="fas fa-chart-line mr-2"></i>查看学习进度
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

    startTimerGame() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        // 专注小贴士数组
        const focusTips = [
            "深呼吸几次，让自己平静下来再开始学习",
            "把手机放在视线之外，避免分心",
            "准备一杯水，保持身体水分充足",
            "确保学习环境光线充足但不刺眼",
            "坐直身体，保持良好的姿势有助于集中注意力"
        ];
        
        // 随机选择一个小贴士
        const randomTip = focusTips[Math.floor(Math.random() * focusTips.length)];

        modalTitle.textContent = '专注挑战';
        modalContent.innerHTML = `
            <div class="text-center space-y-6">
                <div class="text-6xl mb-4">⏱️</div>
                <h3 class="text-xl font-bold text-gray-800">专注时间挑战</h3>
                <p class="text-gray-600">设定一个学习目标，专注完成它！</p>

                <div class="bg-blue-50 p-6 rounded-xl">
                    <div class="text-4xl font-bold text-blue-600 mb-4" id="timerDisplay">05:00</div>
                    <div class="space-y-3">
                        <input type="text" id="studyGoal" placeholder="输入你的学习目标..."
                               class="w-full p-3 border border-gray-300 rounded-lg text-center">
                        <div class="grid grid-cols-3 gap-2">
                            <button onclick="game.startStudyTimer(5)" class="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors">
                                5分钟
                            </button>
                            <button onclick="game.startStudyTimer(10)" class="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors">
                                10分钟
                            </button>
                            <button onclick="game.startStudyTimer(15)" class="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-colors">
                                15分钟
                            </button>
                            <button onclick="game.startStudyTimer(20)" class="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-colors">
                                20分钟
                            </button>
                            <button onclick="game.startStudyTimer(25)" class="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors">
                                25分钟
                            </button>
                            <button onclick="game.startStudyTimer(30)" class="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition-colors">
                                30分钟
                            </button>
                        </div>
                    </div>
                </div>

                <div id="timerProgress" class="hidden">
                    <div class="bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div id="timerProgressBar" class="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-1000" style="width: 0%"></div>
                    </div>
                    <p class="text-sm text-gray-600 mt-2">专注中...不要放弃！</p>
                </div>

                <!-- 专注小贴士 -->
                <div class="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-400">
                    <p class="text-yellow-800 text-sm"><strong>💡 小贴士：</strong>${randomTip}</p>
                </div>
            </div>
        `;
    }

    startStudyTimer(minutes) {
        const goalInput = document.getElementById('studyGoal');
        if (!goalInput.value.trim()) {
            this.showNotification('请先输入学习目标', 'warning');
            return;
        }

        let totalSeconds = minutes * 60;
        const timerDisplay = document.getElementById('timerDisplay');
        const timerProgress = document.getElementById('timerProgress');
        const progressBar = document.getElementById('timerProgressBar');

        timerProgress.classList.remove('hidden');

        this.studyTimer = setInterval(() => {
            totalSeconds--;

            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            const progress = ((minutes * 60 + seconds) / (this.studyDuration * 60)) * 100;
            progressBar.style.width = `${progress}%`;

            if (totalSeconds <= 0) {
                clearInterval(this.studyTimer);
                this.completeStudyChallenge(goalInput.value);
            }
        }, 1000);

        this.studyDuration = minutes;
    }

    completeStudyChallenge(goal) {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        // 根据专注时长计算奖励
        let coinReward = 30;
        let growthReward = 15;
        
        if (this.studyDuration >= 25) {
            coinReward = 50;
            growthReward = 25;
        } else if (this.studyDuration >= 20) {
            coinReward = 40;
            growthReward = 20;
        }

        this.gameState.coins += coinReward;
        this.gameState.treeProgress += growthReward;
        
        // 记录专注统计数据
        if (!this.gameState.focusStats) {
            this.gameState.focusStats = [];
        }
        
        const stat = {
            date: new Date().toISOString(),
            duration: this.studyDuration,
            goal: goal,
            coins: coinReward,
            growth: growthReward
        };
        
        this.gameState.focusStats.push(stat);
        
        this.updateUI();
        this.updateGrowthTree();
        this.saveGameState();

        modalTitle.textContent = '挑战完成！';
        modalContent.innerHTML = `
            <div class="text-center space-y-4">
                <div class="text-6xl mb-4">🎉</div>
                <h3 class="text-xl font-bold text-gray-800">专注挑战成功！</h3>
                <p class="text-gray-600">你完成了学习目标：<strong>${goal}</strong></p>
                
                <div class="bg-blue-50 p-4 rounded-xl">
                    <p class="text-blue-800 font-semibold">专注统计</p>
                    <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                            <span class="text-blue-600">专注时长：</span>
                            <span class="font-semibold">${this.studyDuration} 分钟</span>
                        </div>
                        <div>
                            <span class="text-blue-600">完成时间：</span>
                            <span class="font-semibold">${new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-xl">
                    <p class="text-green-800 font-semibold">获得奖励</p>
                    <div class="flex items-center justify-center space-x-4 mt-2">
                        <span class="text-green-600">
                            <i class="fas fa-coins mr-1"></i>+${coinReward} 金币
                        </span>
                        <span class="text-green-600">
                            <i class="fas fa-seedling mr-1"></i>+${growthReward} 成长值
                        </span>
                    </div>
                </div>

                <div class="flex space-x-3">
                    <button onclick="game.closeModal()" class="btn-secondary flex-1">
                        完成
                    </button>
                    <button onclick="game.startTimerGame()" class="btn-primary flex-1">
                        再来一次
                    </button>
                </div>
            </div>
        `;

        this.showNotification(`专注挑战完成！获得${coinReward}金币和${growthReward}成长值`, 'success');
    }

    showParentCenter() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        // 检查家长模式密码
        const parentPassword = prompt('请输入家长密码（默认：1234）：');
        if (parentPassword !== '1234') {
            this.showNotification('密码错误', 'error');
            return;
        }

        modalTitle.textContent = '家长中心';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">👨‍👩‍👧‍👦</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">家长功能面板</h3>
                    <p class="text-gray-600">查看孩子的成长记录和设置</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.showGrowthReport()">
                        <div class="text-3xl mb-2">📊</div>
                        <h4 class="font-semibold text-gray-800">成长报告</h4>
                        <p class="text-xs text-gray-600 mt-1">查看详细数据</p>
                    </div>

                    <div class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.showTaskSettings()">
                        <div class="text-3xl mb-2">⚙️</div>
                        <h4 class="font-semibold text-gray-800">任务设置</h4>
                        <p class="text-xs text-gray-600 mt-1">自定义任务</p>
                    </div>

                    <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.showTimeControl()">
                        <div class="text-3xl mb-2">⏰</div>
                        <h4 class="font-semibold text-gray-800">时间控制</h4>
                        <p class="text-xs text-gray-600 mt-1">使用时间管理</p>
                    </div>

                    <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl text-center cursor-pointer hover:scale-105 transition-transform" onclick="game.showEducationGuide()">
                        <div class="text-3xl mb-2">📖</div>
                        <h4 class="font-semibold text-gray-800">教育指导</h4>
                        <p class="text-xs text-gray-600 mt-1">专业建议</p>
                    </div>
                </div>

                <div class="bg-yellow-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-yellow-800 mb-2">今日成长数据</h4>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-yellow-600">完成任务：</span>
                            <span class="font-semibold">${this.gameState.completedTasks.filter(t => this.isToday(t.completedDate)).length} 个</span>
                        </div>
                        <div>
                            <span class="text-yellow-600">获得金币：</span>
                            <span class="font-semibold">+${this.calculateTodayEarnings()} 枚</span>
                        </div>
                        <div>
                            <span class="text-yellow-600">学习时长：</span>
                            <span class="font-semibold">25 分钟</span>
                        </div>
                        <div>
                            <span class="text-yellow-600">连续天数：</span>
                            <span class="font-semibold">${this.gameState.consecutiveDays} 天</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.openModal();
    }

    showGrowthReport() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '成长报告';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                    <h3 class="font-semibold text-gray-800 mb-4">本周成长概览</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-600">${this.gameState.completedTasks.length}</div>
                            <p class="text-sm text-gray-600">完成任务</p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-green-600">${this.gameState.treeLevel}</div>
                            <p class="text-sm text-gray-600">当前等级</p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-yellow-600">${this.gameState.coins}</div>
                            <p class="text-sm text-gray-600">总金币</p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-purple-600">${this.gameState.achievements.filter(a => a.unlocked).length}</div>
                            <p class="text-sm text-gray-600">获得成就</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-xl border">
                    <h4 class="font-semibold text-gray-800 mb-3">任务完成分布</h4>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">家务任务</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-24 bg-gray-200 rounded-full h-2">
                                    <div class="bg-blue-500 h-2 rounded-full" style="width: 70%"></div>
                                </div>
                                <span class="text-sm font-semibold">7个</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">学习任务</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-24 bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full" style="width: 85%"></div>
                                </div>
                                <span class="text-sm font-semibold">12个</span>
                            </div>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">亲子任务</span>
                            <div class="flex items-center space-x-2">
                                <div class="w-24 bg-gray-200 rounded-full h-2">
                                    <div class="bg-purple-500 h-2 rounded-full" style="width: 60%"></div>
                                </div>
                                <span class="text-sm font-semibold">5个</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-center">
                    <button onclick="game.exportReport()" class="btn-primary">
                        <i class="fas fa-download mr-2"></i>导出报告
                    </button>
                </div>
            </div>
        `;
    }

    // 生成每日任务
    generateDailyTasks() {
        if (this.gameState.currentTasks.length === 0) {
            // 随机选择4-6个任务
            const taskCount = Math.floor(Math.random() * 3) + 4;
            const shuffledTasks = [...this.tasks].sort(() => Math.random() - 0.5);
            const selectedTasks = shuffledTasks.slice(0, taskCount);

            this.gameState.currentTasks = selectedTasks.map(task => ({
                id: task.id,
                completed: false,
                claimed: false
            }));

            this.saveGameState();
        }

        document.getElementById('taskCount').textContent = this.gameState.currentTasks.filter(t => !t.completed).length;
    }

    refreshTasks() {
        if (confirm('刷新任务将清空当前任务进度，确定要继续吗？')) {
            this.gameState.currentTasks = [];
            this.generateDailyTasks();
            this.showDailyTasks();
            this.showNotification('任务已刷新', 'success');
        }
    }

    showTaskSuggestions() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '任务建议';
        modalContent.innerHTML = `
            <div class="space-y-4">
                <div class="bg-blue-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-blue-800 mb-2">根据孩子的表现推荐</h4>
                    <p class="text-sm text-blue-700">基于近期的任务完成情况，为您推荐以下任务：</p>
                </div>

                <div class="space-y-3">
                    <div class="bg-white p-4 rounded-xl border">
                        <div class="flex items-start justify-between">
                            <div>
                                <h5 class="font-semibold text-gray-800">户外运动时间</h5>
                                <p class="text-sm text-gray-600 mt-1">进行30分钟户外运动，增强体质</p>
                                <div class="flex items-center space-x-2 mt-2">
                                    <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">推荐</span>
                                    <span class="text-xs text-orange-600 font-semibold">
                                        <i class="fas fa-coins mr-1"></i>25 金币
                                    </span>
                                </div>
                            </div>
                            <button onclick="game.addCustomTask('户外运动时间', 25)" class="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                                添加
                            </button>
                        </div>
                    </div>

                    <div class="bg-white p-4 rounded-xl border">
                        <div class="flex items-start justify-between">
                            <div>
                                <h5 class="font-semibold text-gray-800">艺术创作</h5>
                                <p class="text-sm text-gray-600 mt-1">完成一幅绘画或手工作品</p>
                                <div class="flex items-center space-x-2 mt-2">
                                    <span class="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">创意</span>
                                    <span class="text-xs text-orange-600 font-semibold">
                                        <i class="fas fa-coins mr-1"></i>30 金币
                                    </span>
                                </div>
                            </div>
                            <button onclick="game.addCustomTask('艺术创作', 30)" class="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                                添加
                            </button>
                        </div>
                    </div>
                </div>

                <div class="text-center">
                    <button onclick="game.closeModal()" class="btn-secondary">
                        关闭
                    </button>
                </div>
            </div>
        `;
    }

    addCustomTask(title, points) {
        const newTask = {
            id: Date.now(),
            title: title,
            description: `自定义任务：${title}`,
            points: points,
            category: "自定义",
            difficulty: "中等"
        };

        this.tasks.push(newTask);

        this.gameState.currentTasks.push({
            id: newTask.id,
            completed: false,
            claimed: false
        });

        this.updateUI();
        this.saveGameState();
        this.showNotification('任务添加成功', 'success');
        this.showDailyTasks();
    }

    startFamilyDiscussion() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '家庭讨论';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">👨‍👩‍👧‍👦</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">家庭讨论时间</h3>
                    <p class="text-gray-600">一起分享想法，增进理解</p>
                </div>

                <div class="bg-yellow-50 p-6 rounded-xl">
                    <h4 class="font-semibold text-yellow-800 mb-4">今日话题：什么是真正的朋友？</h4>
                    <div class="space-y-3 text-sm text-yellow-700">
                        <p>💭 <strong>引导问题：</strong></p>
                        <ul class="list-disc list-inside space-y-1 ml-4">
                            <li>你认为好朋友应该具备哪些品质？</li>
                            <li>当朋友遇到困难时，你会怎么做？</li>
                            <li>如何成为别人眼中的好朋友？</li>
                            <li>分享一个和你好朋友之间的故事</li>
                        </ul>
                    </div>
                </div>

                <div class="bg-blue-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-blue-800 mb-2">
                        <i class="fas fa-lightbulb mr-2"></i>讨论建议
                    </h4>
                    <ul class="text-sm text-blue-700 space-y-1">
                        <li>• 每个人都有机会分享自己的想法</li>
                        <li>• 认真倾听他人的观点</li>
                        <li>• 可以举例说明，让讨论更生动</li>
                        <li>• 讨论结束后，说说自己的收获</li>
                    </ul>
                </div>

                <div class="text-center">
                    <button onclick="game.completeFamilyDiscussion()" class="btn-primary">
                        <i class="fas fa-check mr-2"></i>完成讨论
                    </button>
                </div>
            </div>
        `;
    }

    completeFamilyDiscussion() {
        this.gameState.coins += 20;
        this.gameState.treeProgress += 10;
        this.updateUI();
        this.updateGrowthTree();
        this.saveGameState();

        this.showNotification('家庭讨论完成！获得20金币', 'success');
        this.closeModal();
    }

    updateGrowthTree() {
        // 检查是否升级
        while (this.gameState.treeProgress >= 100) {
            this.gameState.treeProgress -= 100;
            this.gameState.treeLevel++;
            this.showNotification(`恭喜！成长树升到了${this.gameState.treeLevel}级`, 'success');
        }

        // 更新成长树显示
        const treeContainer = document.getElementById('growthTree');
        const treeEmojis = ['🌱', '🌿', '🌳', '🌲', '🎋'];
        const emojiIndex = Math.min(this.gameState.treeLevel - 1, treeEmojis.length - 1);

        treeContainer.innerHTML = `
            <div class="text-center">
                <div class="text-6xl mb-2 tree-emoji tree-level-${this.gameState.treeLevel}">${treeEmojis[emojiIndex]}</div>
                <p class="text-sm text-gray-600">Level ${this.gameState.treeLevel} 成长树</p>
            </div>
        `;

        // 更新进度条
        document.getElementById('treeLevel').textContent = this.gameState.treeLevel;
        document.getElementById('growthProgress').style.width = `${this.gameState.treeProgress}%`;
        document.getElementById('growthText').textContent = `${this.gameState.treeProgress}%`;
    }

    checkAchievements() {
        this.achievements.forEach(achievement => {
            if (!achievement.unlocked) {
                let unlocked = false;

                switch(achievement.condition) {
                    case 'tasksCompleted':
                        unlocked = this.gameState.completedTasks.length >= achievement.value;
                        break;
                    case 'consecutiveDays':
                        unlocked = this.gameState.consecutiveDays >= achievement.value;
                        break;
                    case 'treeLevel':
                        unlocked = this.gameState.treeLevel >= achievement.value;
                        break;
                    case 'coinsCollected':
                        unlocked = this.gameState.coins >= achievement.value;
                        break;
                    case 'heartsCollected':
                        unlocked = this.gameState.hearts >= achievement.value;
                        break;
                    case 'categoryTasks':
                        unlocked = this.gameState.completedTasks.filter(task => {
                            const taskData = this.tasks.find(t => t.id === task.id);
                            return taskData && taskData.category === achievement.category;
                        }).length >= achievement.value;
                        break;
                    case 'totalFocusTime':
                        unlocked = this.calculateTotalFocusTime() >= achievement.value;
                        break;
                    case 'moralLessons':
                        unlocked = (this.gameState.moralLessonsCompleted || 0) >= achievement.value;
                        break;
                }

                if (unlocked) {
                    achievement.unlocked = true;
                    this.gameState.achievements.push(achievement);
                    this.showNotification(`🏆 获得成就：${achievement.name}`, 'success');
                    this.gameState.coins += 50; // 成就奖励
                }
            }
        });
    }

    calculateTotalFocusTime() {
        if (!this.gameState.focusStats) return 0;
        return this.gameState.focusStats.reduce((total, stat) => total + stat.duration, 0);
    }

    showAchievements() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '成就徽章';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">🏆</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">我的成就</h3>
                    <p class="text-gray-600">已获得 ${this.gameState.achievements.length}/${this.achievements.length} 个成就</p>
                </div>

                <div class="grid grid-cols-3 gap-4">
                    ${this.achievements.map(achievement => {
                        const isUnlocked = this.gameState.achievements.find(a => a.id === achievement.id);
                        return `
                            <div class="text-center">
                                <div class="achievement-badge ${isUnlocked ? '' : 'locked'}">
                                    <span class="text-2xl">${isUnlocked ? achievement.icon : '🔒'}</span>
                                </div>
                                <p class="text-xs font-semibold mt-2 ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}">${achievement.name}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this.openModal();
    }

    showNotification(message, type = 'info') {
        // 创建通知队列管理
        if (!this.notificationQueue) {
            this.notificationQueue = [];
            this.isShowingNotification = false;
        }

        this.notificationQueue.push({ message, type });
        this.processNotificationQueue();
    }

  processNotificationQueue() {
        if (this.isShowingNotification || this.notificationQueue.length === 0) {
            return;
        }

        this.isShowingNotification = true;
        const { message, type } = this.notificationQueue.shift();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // 添加更好的图标映射
        const iconMap = {
            'success': 'fa-check-circle text-green-500',
            'warning': 'fa-exclamation-triangle text-yellow-500',
            'error': 'fa-times-circle text-red-500',
            'info': 'fa-info-circle text-blue-500'
        };

        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas ${iconMap[type] || iconMap.info}"></i>
                <span class="flex-1">${message}</span>
                <button onclick="this.parentElement.parentElement.remove(); game.isShowingNotification = false; game.processNotificationQueue();"
                        class="ml-2 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // 使用动画类
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // 自动移除通知
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
                this.isShowingNotification = false;
                this.processNotificationQueue();
            }, 300);
        }, 4000);
    }

    openModal() {
        document.getElementById('contentModal').classList.remove('hidden');
        document.getElementById('modalContent').classList.add('modal-content');
    }

    closeModal() {
        document.getElementById('contentModal').classList.add('hidden');
        if (this.studyTimer) {
            clearInterval(this.studyTimer);
        }
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        const lastLogin = this.gameState.lastLoginDate;

        if (lastLogin !== today) {
            // 新的一天，重置每日任务
            this.gameState.currentTasks = [];
            this.gameState.lastLoginDate = today;

            // 检查连续登录
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastLogin === yesterday.toDateString()) {
                this.gameState.consecutiveDays++;
            } else {
                this.gameState.consecutiveDays = 1;
            }

            // 连续登录奖励
            if (this.gameState.consecutiveDays > 1) {
                const bonusCoins = this.gameState.consecutiveDays * 5;
                this.gameState.coins += bonusCoins;
                this.showNotification(`连续登录${this.gameState.consecutiveDays}天，获得${bonusCoins}金币奖励！`, 'success');
            }

            this.saveGameState();
        }
    }

    isToday(dateString) {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    calculateTodayEarnings() {
        const todayTasks = this.gameState.completedTasks.filter(task => this.isToday(task.completedDate));
        return todayTasks.reduce((total, task) => {
            const taskData = this.tasks.find(t => t.id === task.id);
            return total + (taskData ? taskData.points : 0);
        }, 0);
    }

    showWelcomeMessage() {
        const hour = new Date().getHours();
        let greeting = '早上好';
        if (hour >= 12 && hour < 18) greeting = '下午好';
        else if (hour >= 18) greeting = '晚上好';

        if (this.gameState.consecutiveDays === 1) {
            this.showNotification(`${greeting}！欢迎来到家庭成长乐园！`, 'info');
        } else {
            this.showNotification(`${greeting}！连续登录${this.gameState.consecutiveDays}天，真棒！`, 'success');
        }
    }

    updateUI() {
        // 使用防抖来优化频繁的UI更新
        this.debounce(() => {
            this.performUIUpdate();
        }, 100, 'uiUpdate');
    }

    performUIUpdate() {
        // 批量更新DOM以提高性能
        const updates = [
            () => {
                const coinsElement = document.getElementById('coins');
                if (coinsElement) coinsElement.textContent = this.gameState.coins;
            },
            () => {
                const heartsElement = document.getElementById('hearts');
                if (heartsElement) heartsElement.textContent = this.gameState.hearts;
            },
            () => {
                const taskCountElement = document.getElementById('taskCount');
                if (taskCountElement) {
                    taskCountElement.textContent = this.gameState.currentTasks.filter(t => !t.completed).length;
                }
            }
        ];

        // 使用requestAnimationFrame来优化DOM更新
        requestAnimationFrame(() => {
            updates.forEach(update => update());
            this.updateGrowthTree();
        });
    }

    saveGameState() {
        // 使用防抖来优化频繁的存储操作
        this.debounce(() => {
            this.performSave();
        }, 300, 'saveGame');
    }

  performSave() {
        try {
            localStorage.setItem('familyGrowthGame', JSON.stringify(this.gameState));
        } catch (error) {
            console.error('保存游戏状态失败:', error);
            this.showNotification('数据保存失败', 'error');
        }
    }

    loadGameState() {
        const savedState = localStorage.getItem('familyGrowthGame');
        if (savedState) {
            this.gameState = JSON.parse(savedState);
        }
    }

    exportReport() {
        const report = {
            date: new Date().toLocaleDateString(),
            treeLevel: this.gameState.treeLevel,
            totalCoins: this.gameState.coins,
            completedTasks: this.gameState.completedTasks.length,
            consecutiveDays: this.gameState.consecutiveDays,
            achievements: this.gameState.achievements.map(a => a.name)
        };

        const reportText = `
家庭成长乐园 - 成长报告
=========================
生成日期：${report.date}
成长树等级：${report.treeLevel}
总金币：${report.totalCoins}
完成任务：${report.completedTasks} 个
连续登录：${report.consecutiveDays} 天
获得成就：${report.achievements.join(', ')}

继续加油，快乐成长！
        `;

        // 创建下载链接
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `成长报告_${report.date.replace(/\//g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('报告已导出', 'success');
    }

    // 获取推荐书籍列表
  getRecommendedBooks() {
        return [
            { id: 1, title: "小王子", author: "安托万·德·圣-埃克苏佩里", category: "文学", age: "8-12岁", readingTime: "2小时", rating: 5, cover: "📖", isRecommended: true },
            { id: 2, title: "神奇校车", author: "乔安娜·柯尔", category: "科普", age: "6-10岁", readingTime: "1小时", rating: 5, cover: "🚌", isRecommended: true },
            { id: 3, title: "夏洛的网", author: "E.B.怀特", category: "文学", age: "8-12岁", readingTime: "3小时", rating: 5, cover: "🕷️", isRecommended: true },
            { id: 4, title: "海底两万里", author: "儒勒·凡尔纳", category: "科幻", age: "10-14岁", readingTime: "5小时", rating: 4, cover: "🌊", isRecommended: true },
            { id: 5, title: "格林童话", author: "格林兄弟", category: "童话", age: "6-12岁", readingTime: "4小时", rating: 5, cover: "🏰", isRecommended: true },
            { id: 6, title: "昆虫记", author: "让-亨利·法布尔", category: "科普", age: "8-14岁", readingTime: "3小时", rating: 4, cover: "🐛", isRecommended: true }
        ];
    }

    // 获取所有书籍（推荐+自定义）
  getAllBooks() {
        const recommendedBooks = this.getRecommendedBooks();
        const customBooks = this.gameState.customBooks || [];
        return [...recommendedBooks, ...customBooks];
    }

    // 根据ID查找书籍
  findBookById(bookId) {
        const allBooks = this.getAllBooks();
        return allBooks.find(b => b.id === bookId);
    }

  showReadingList() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        // 推荐书单
        const recommendedBooks = this.getRecommendedBooks();

        // 获取自定义书单
        const customBooks = this.gameState.customBooks || [];

        modalTitle.textContent = '阅读书单';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">📚</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">推荐阅读书单</h3>
                    <p class="text-gray-600">精选优质书籍，培养阅读习惯</p>
                </div>

                <!-- 阅读统计 -->
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="font-semibold text-gray-800">本月阅读目标</h4>
                            <p class="text-sm text-gray-600">已读 ${this.gameState.readingList?.filter(book => book.completed).length || 0} / 3 本</p>
                        </div>
                        <div class="text-2xl">🎯</div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3 mt-3">
                        <div class="bg-gradient-to-r from-blue-400 to-purple-400 h-3 rounded-full" style="width: ${Math.min(((this.gameState.readingList?.filter(book => book.completed).length || 0) / 3) * 100, 100)}%"></div>
                    </div>
                </div>

                <!-- 分类筛选 -->
                <div class="flex space-x-2 overflow-x-auto pb-2">
                    <button onclick="game.filterBooks('all')" class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm whitespace-nowrap">全部</button>
                    <button onclick="game.filterBooks('文学')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm whitespace-nowrap hover:bg-gray-300">文学</button>
                    <button onclick="game.filterBooks('科普')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm whitespace-nowrap hover:bg-gray-300">科普</button>
                    <button onclick="game.filterBooks('童话')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm whitespace-nowrap hover:bg-gray-300">童话</button>
                    <button onclick="game.filterBooks('科幻')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm whitespace-nowrap hover:bg-gray-300">科幻</button>
                    <button onclick="game.showCustomBookForm()" class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm whitespace-nowrap hover:bg-green-600">
                        <i class="fas fa-plus mr-1"></i>添加书籍
                    </button>
                </div>

                <!-- 推荐书籍和自定义书籍标签切换 -->
                <div class="flex space-x-4 border-b">
                    <button onclick="game.switchBookTab('recommended')" id="recommendedTab" class="pb-2 px-1 border-b-2 border-blue-500 text-blue-600 font-semibold">推荐书籍</button>
                    <button onclick="game.switchBookTab('custom')" id="customTab" class="pb-2 px-1 border-b-2 border-transparent text-gray-500">我的书单</button>
                </div>

                <!-- 推荐书籍列表 -->
                <div class="space-y-3" id="recommendedBooksList">
                    ${recommendedBooks.map(book => this.createBookCard(book)).join('')}
                </div>

                <!-- 自定义书籍列表 -->
                <div class="space-y-3 hidden" id="customBooksList">
                    ${customBooks.length > 0 ?
                        customBooks.map(book => this.createBookCard(book)).join('') :
                        '<div class="text-center py-8 text-gray-500">还没有添加自定义书籍，点击上方"添加书籍"按钮开始添加</div>'
                    }
                </div>

                <!-- 我的书单 -->
                <div class="bg-green-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-green-800 mb-3">我的阅读记录</h4>
                    <div class="space-y-2">
                        ${this.generateReadingListHTML()}
                    </div>
                </div>

                <div class="text-center">
                    <button onclick="game.closeModal()" class="btn-primary">
                        关闭
                    </button>
                </div>
            </div>
        `;

        // 合并推荐书籍和自定义书籍
        this.currentBookList = {
            recommended: recommendedBooks,
            custom: customBooks,
            all: [...recommendedBooks, ...customBooks]
        };

        this.currentActiveTab = 'recommended';
        this.openModal();
    }

  createBookCard(book) {
        // 安全检查
        if (!book || !book.id) {
            console.warn('createBookCard: 无效的书籍对象', book);
            return '<div class="p-4 text-red-500">书籍数据无效</div>';
        }

        const isInList = this.gameState.readingList?.find(b => b.id === book.id);
        const isCompleted = isInList?.completed;
        const isCustomBook = !book.isRecommended;

        return `
            <div class="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow book-card ${isCustomBook ? 'border-green-200' : ''}">
                <div class="flex items-start space-x-4">
                    <div class="text-4xl">${book.cover || '📖'}</div>
                    <div class="flex-1">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center space-x-2">
                                    <h4 class="font-semibold text-gray-800">${book.title || '未知书名'}</h4>
                                    ${isCustomBook ? '<span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">自定义</span>' : ''}
                                </div>
                                <p class="text-sm text-gray-600">${book.author || '未知作者'}</p>
                                <div class="flex items-center space-x-2 mt-2">
                                    <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">${book.category || '未分类'}</span>
                                    <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">${book.age || '全年龄'}</span>
                                    <span class="text-xs text-gray-500">${book.readingTime || '待定'}</span>
                                </div>
                                <div class="flex items-center mt-1">
                                    ${'⭐'.repeat(book.rating || 3)}
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                ${isCustomBook ? `
                                    <button onclick="game.editCustomBook('${book.id}')"
                                            class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="编辑">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="game.deleteCustomBook('${book.id}')"
                                            class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="删除">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                                <button onclick="game.addBookToList('${book.id}')"
                                        class="px-3 py-1 ${isCompleted ? 'bg-green-500 text-white' : isInList ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-lg text-sm hover:opacity-90 transition-opacity">
                                    ${isCompleted ? '已完成' : isInList ? '已添加' : '添加'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

  addBookToList(bookId) {
        const book = this.findBookById(bookId);
        if (!book) return;

        if (!this.gameState.readingList) {
            this.gameState.readingList = [];
        }

        // 检查是否已经在书单中
        if (this.gameState.readingList.find(b => b.id === bookId)) {
            this.showNotification('这本书已经在你的书单中了', 'info');
            return;
        }

        // 添加到书单
        this.gameState.readingList.push({
            ...book,
            addedDate: new Date().toISOString(),
            completed: false
        });

        this.saveGameState();
        this.showReadingList(); // 刷新界面
        this.showNotification(`《${book.title}》已添加到阅读书单`, 'success');
    }

  completeBook(bookId) {
        const book = this.gameState.readingList.find(b => b.id === bookId);
        if (!book) return;

        book.completed = true;
        book.completedDate = new Date().toISOString();

        // 给予奖励
        this.gameState.coins += 20;
        this.gameState.treeProgress += 10;

        this.updateUI();
        this.updateGrowthTree();
        this.saveGameState();
        this.showReadingList(); // 刷新界面
        this.showNotification(`恭喜完成《${book.title}》！获得20金币`, 'success');
    }

  filterBooks(category) {
        // 重新获取最新的书籍列表
        const recommendedBooks = this.getRecommendedBooks();
        const customBooks = this.gameState.customBooks || [];

        const currentBooks = this.currentActiveTab === 'custom' ? customBooks : recommendedBooks;

        const filteredBooks = category === 'all' ?
            currentBooks :
            currentBooks.filter(book => book.category === category);

        // 更新筛选按钮状态（排除添加书籍按钮）
        document.querySelectorAll('.flex.space-x-2 button').forEach(btn => {
            if (btn.textContent.includes('添加书籍')) return; // 跳过添加书籍按钮

            if ((category === 'all' && btn.textContent === '全部') ||
                btn.textContent.includes(category)) {
                btn.className = 'px-4 py-2 bg-blue-500 text-white rounded-lg text-sm whitespace-nowrap';
            } else {
                btn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm whitespace-nowrap hover:bg-gray-300';
            }
        });

        // 更新书籍列表
        const listId = this.currentActiveTab === 'custom' ? 'customBooksList' : 'recommendedBooksList';
        const listElement = document.getElementById(listId);

        if (listElement) {
            if (filteredBooks.length === 0 && this.currentActiveTab === 'custom') {
                listElement.innerHTML = '<div class="text-center py-8 text-gray-500">还没有添加自定义书籍，点击上方"添加书籍"按钮开始添加</div>';
            } else {
                listElement.innerHTML = filteredBooks.map(book => this.createBookCard(book)).join('');
            }
        }
    }

  // 切换书籍标签页
  switchBookTab(tab) {
        this.currentActiveTab = tab;

        // 更新标签样式
        const recommendedTab = document.getElementById('recommendedTab');
        const customTab = document.getElementById('customTab');

        if (tab === 'recommended') {
            recommendedTab.className = 'pb-2 px-1 border-b-2 border-blue-500 text-blue-600 font-semibold';
            customTab.className = 'pb-2 px-1 border-b-2 border-transparent text-gray-500';
            document.getElementById('recommendedBooksList').classList.remove('hidden');
            document.getElementById('customBooksList').classList.add('hidden');
        } else {
            recommendedTab.className = 'pb-2 px-1 border-b-2 border-transparent text-gray-500';
            customTab.className = 'pb-2 px-1 border-b-2 border-blue-500 text-blue-600 font-semibold';
            document.getElementById('recommendedBooksList').classList.add('hidden');
            document.getElementById('customBooksList').classList.remove('hidden');

            // 更新自定义书籍列表显示
            this.updateCustomBooksDisplay();
        }

        // 重置筛选为"全部"
        this.filterBooks('all');
    }

  // 生成阅读记录HTML
  generateReadingListHTML() {
        if (!this.gameState.readingList || this.gameState.readingList.length === 0) {
            return '<p class="text-gray-600 text-center py-4">还没有添加阅读记录</p>';
        }

        const htmlItems = this.gameState.readingList.map(book => {
            const bookCover = book.cover || '📖';
            const bookTitle = book.title || '未知书名';
            const bookAuthor = book.author || '未知作者';
            const bookTime = book.readingTime || '待定';

            if (book.completed) {
                return `
                    <div class="bg-white p-3 rounded-lg flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="text-2xl">${bookCover}</div>
                            <div>
                                <div class="font-semibold text-gray-800">${bookTitle}</div>
                                <div class="text-xs text-gray-600">${bookAuthor} | ${bookTime}</div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <span class="text-green-500 text-sm">✓ 已完成</span>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="bg-white p-3 rounded-lg flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="text-2xl">${bookCover}</div>
                            <div>
                                <div class="font-semibold text-gray-800">${bookTitle}</div>
                                <div class="text-xs text-gray-600">${bookAuthor} | ${bookTime}</div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button onclick="game.completeBook('${book.id}')" class="text-blue-500 text-sm hover:text-blue-700">标记完成</button>
                        </div>
                    </div>
                `;
            }
        });

        return htmlItems.join('');
    }

  // 更新自定义书籍显示
  updateCustomBooksDisplay() {
        const customBooks = this.gameState.customBooks || [];
        const customBooksList = document.getElementById('customBooksList');

        if (customBooks.length === 0) {
            customBooksList.innerHTML = '<div class="text-center py-8 text-gray-500">还没有添加自定义书籍，点击上方"添加书籍"按钮开始添加</div>';
        } else {
            customBooksList.innerHTML = customBooks.map(book => this.createBookCard(book)).join('');
        }
    }

  // 显示自定义书籍添加表单
  showCustomBookForm() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '添加自定义书籍';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">📚</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">添加自定义书籍</h3>
                    <p class="text-gray-600">添加你喜欢的书籍到个人书单</p>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">书名 *</label>
                        <input type="text" id="customBookTitle" placeholder="请输入书名"
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">作者 *</label>
                        <input type="text" id="customBookAuthor" placeholder="请输入作者"
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
                            <select id="customBookCategory" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="">选择分类</option>
                                <option value="文学">文学</option>
                                <option value="科普">科普</option>
                                <option value="童话">童话</option>
                                <option value="科幻">科幻</option>
                                <option value="历史">历史</option>
                                <option value="艺术">艺术</option>
                                <option value="哲学">哲学</option>
                                <option value="其他">其他</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">适合年龄</label>
                            <input type="text" id="customBookAge" placeholder="如：8-12岁"
                                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">预计阅读时间</label>
                            <input type="text" id="customBookReadingTime" placeholder="如：2小时"
                                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">评分</label>
                            <select id="customBookRating" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="5">⭐⭐⭐⭐⭐ 非常推荐</option>
                                <option value="4">⭐⭐⭐⭐ 推荐</option>
                                <option value="3">⭐⭐⭐ 一般</option>
                                <option value="2">⭐⭐ 不太推荐</option>
                                <option value="1">⭐ 不推荐</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">封面图标</label>
                        <div class="grid grid-cols-8 gap-2">
                            ${['📖', '📚', '📕', '📗', '📘', '📙', '📔', '📓', '📒', '📑', '📜', '📃', '🏛️', '🌟', '🎭', '🎨'].map(emoji =>
                                `<button onclick="game.selectBookEmoji('${emoji}')" class="emoji-btn p-2 border rounded hover:bg-blue-100" data-emoji="${emoji}">${emoji}</button>`
                            ).join('')}
                        </div>
                        <input type="hidden" id="selectedBookEmoji" value="📖">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">备注（可选）</label>
                        <textarea id="customBookNotes" placeholder="添加阅读心得或推荐理由..."
                                  class="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
                    </div>
                </div>

                <div class="flex space-x-3">
                    <button onclick="game.closeModal()" class="btn-secondary flex-1">
                        取消
                    </button>
                    <button onclick="game.saveCustomBook()" class="btn-primary flex-1">
                        保存书籍
                    </button>
                </div>
            </div>
        `;

        // 默认选中第一个emoji
        document.querySelector('.emoji-btn').classList.add('bg-blue-100', 'border-blue-500');

        this.openModal();
    }

  // 选择书籍emoji
  selectBookEmoji(emoji) {
        document.getElementById('selectedBookEmoji').value = emoji;
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.classList.remove('bg-blue-100', 'border-blue-500');
            btn.classList.add('border-gray-300');
        });

        // 安全获取点击的元素
        const clickedBtn = event?.target || document.querySelector(`[data-emoji="${emoji}"]`);
        if (clickedBtn) {
            clickedBtn.classList.remove('border-gray-300');
            clickedBtn.classList.add('bg-blue-100', 'border-blue-500');
        }
    }

  // 保存自定义书籍
  saveCustomBook() {
        const title = document.getElementById('customBookTitle').value.trim();
        const author = document.getElementById('customBookAuthor').value.trim();
        const category = document.getElementById('customBookCategory').value;
        const age = document.getElementById('customBookAge').value.trim() || '全年龄';
        const readingTime = document.getElementById('customBookReadingTime').value.trim() || '待定';
        const rating = parseInt(document.getElementById('customBookRating').value);
        const cover = document.getElementById('selectedBookEmoji').value || '📖';
        const notes = document.getElementById('customBookNotes').value.trim();

        // 验证必填字段
        if (!title || !author || !category) {
            this.showNotification('请填写必填字段', 'warning');
            return;
        }

        // 初始化自定义书单
        if (!this.gameState.customBooks) {
            this.gameState.customBooks = [];
        }

        // 创建自定义书籍
        const customBook = {
            id: Date.now().toString(),
            title: title,
            author: author,
            category: category,
            age: age,
            readingTime: readingTime,
            rating: rating,
            cover: cover,
            notes: notes,
            isRecommended: false,
            addedDate: new Date().toISOString()
        };

        // 添加到自定义书单
        this.gameState.customBooks.push(customBook);
        this.saveGameState();

        this.closeModal();

        // 如果当前在自定义标签页，直接更新显示
        if (this.currentActiveTab === 'custom') {
            this.updateCustomBooksDisplay();
        } else {
            this.showReadingList(); // 刷新界面
        }

        this.showNotification(`《${title}》已添加到自定义书单`, 'success');
    }

  // 编辑自定义书籍
  editCustomBook(bookId) {
        const book = this.gameState.customBooks?.find(b => b.id === bookId);
        if (!book) return;

        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '编辑自定义书籍';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">✏️</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">编辑自定义书籍</h3>
                    <p class="text-gray-600">修改书籍信息</p>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">书名 *</label>
                        <input type="text" id="editBookTitle" value="${book.title}"
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">作者 *</label>
                        <input type="text" id="editBookAuthor" value="${book.author}"
                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
                            <select id="editBookCategory" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="文学" ${book.category === '文学' ? 'selected' : ''}>文学</option>
                                <option value="科普" ${book.category === '科普' ? 'selected' : ''}>科普</option>
                                <option value="童话" ${book.category === '童话' ? 'selected' : ''}>童话</option>
                                <option value="科幻" ${book.category === '科幻' ? 'selected' : ''}>科幻</option>
                                <option value="历史" ${book.category === '历史' ? 'selected' : ''}>历史</option>
                                <option value="艺术" ${book.category === '艺术' ? 'selected' : ''}>艺术</option>
                                <option value="哲学" ${book.category === '哲学' ? 'selected' : ''}>哲学</option>
                                <option value="其他" ${book.category === '其他' ? 'selected' : ''}>其他</option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">适合年龄</label>
                            <input type="text" id="editBookAge" value="${book.age}"
                                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">预计阅读时间</label>
                            <input type="text" id="editBookReadingTime" value="${book.readingTime}"
                                   class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">评分</label>
                            <select id="editBookRating" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option value="5" ${book.rating === 5 ? 'selected' : ''}>⭐⭐⭐⭐⭐ 非常推荐</option>
                                <option value="4" ${book.rating === 4 ? 'selected' : ''}>⭐⭐⭐⭐ 推荐</option>
                                <option value="3" ${book.rating === 3 ? 'selected' : ''}>⭐⭐⭐ 一般</option>
                                <option value="2" ${book.rating === 2 ? 'selected' : ''}>⭐⭐ 不太推荐</option>
                                <option value="1" ${book.rating === 1 ? 'selected' : ''}>⭐ 不推荐</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">封面图标</label>
                        <div class="grid grid-cols-8 gap-2">
                            ${['📖', '📚', '📕', '📗', '📘', '📙', '📔', '📓', '📒', '📑', '📜', '📃', '🏛️', '🌟', '🎭', '🎨'].map(emoji =>
                                `<button onclick="game.selectEditBookEmoji('${emoji}')" class="edit-emoji-btn p-2 border rounded hover:bg-blue-100 ${book.cover === emoji ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}" data-emoji="${emoji}">${emoji}</button>`
                            ).join('')}
                        </div>
                        <input type="hidden" id="editSelectedBookEmoji" value="${book.cover}">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">备注</label>
                        <textarea id="editBookNotes" placeholder="添加阅读心得或推荐理由..."
                                  class="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">${book.notes || ''}</textarea>
                    </div>
                </div>

                <div class="flex space-x-3">
                    <button onclick="game.closeModal()" class="btn-secondary flex-1">
                        取消
                    </button>
                    <button onclick="game.updateCustomBook('${bookId}')" class="btn-primary flex-1">
                        保存修改
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

  // 选择编辑书籍的emoji
  selectEditBookEmoji(emoji) {
        document.getElementById('editSelectedBookEmoji').value = emoji;
        document.querySelectorAll('.edit-emoji-btn').forEach(btn => {
            btn.classList.remove('bg-blue-100', 'border-blue-500');
            btn.classList.add('border-gray-300');
        });

        // 安全获取点击的元素
        const clickedBtn = event?.target || document.querySelector(`[data-emoji="${emoji}"]`);
        if (clickedBtn) {
            clickedBtn.classList.remove('border-gray-300');
            clickedBtn.classList.add('bg-blue-100', 'border-blue-500');
        }
    }

  // 更新自定义书籍
  updateCustomBook(bookId) {
        const bookIndex = this.gameState.customBooks?.findIndex(b => b.id === bookId);
        if (bookIndex === -1) return;

        const title = document.getElementById('editBookTitle').value.trim();
        const author = document.getElementById('editBookAuthor').value.trim();
        const category = document.getElementById('editBookCategory').value;
        const age = document.getElementById('editBookAge').value.trim() || '全年龄';
        const readingTime = document.getElementById('editBookReadingTime').value.trim() || '待定';
        const rating = parseInt(document.getElementById('editBookRating').value);
        const cover = document.getElementById('editSelectedBookEmoji').value || '📖';
        const notes = document.getElementById('editBookNotes').value.trim();

        // 验证必填字段
        if (!title || !author || !category) {
            this.showNotification('请填写必填字段', 'warning');
            return;
        }

        // 更新书籍信息
        this.gameState.customBooks[bookIndex] = {
            ...this.gameState.customBooks[bookIndex],
            title: title,
            author: author,
            category: category,
            age: age,
            readingTime: readingTime,
            rating: rating,
            cover: cover,
            notes: notes,
            updatedDate: new Date().toISOString()
        };

        this.saveGameState();

        this.closeModal();

        // 如果当前在自定义标签页，直接更新显示
        if (this.currentActiveTab === 'custom') {
            this.updateCustomBooksDisplay();
        } else {
            this.showReadingList(); // 刷新界面
        }

        this.showNotification(`《${title}》已更新`, 'success');
    }

  // 删除自定义书籍
  deleteCustomBook(bookId) {
        const book = this.gameState.customBooks?.find(b => b.id === bookId);
        if (!book) return;

        if (confirm(`确定要删除《${book.title}》吗？此操作不可恢复。`)) {
            this.gameState.customBooks = this.gameState.customBooks.filter(b => b.id !== bookId);

            // 同时从阅读记录中删除（如果有的话）
            this.gameState.readingList = this.gameState.readingList?.filter(b => b.id !== bookId) || [];

            this.saveGameState();

            // 如果当前在自定义标签页，直接更新显示
            if (this.currentActiveTab === 'custom') {
                this.updateCustomBooksDisplay();
            } else {
                this.showReadingList(); // 刷新界面
            }

            this.showNotification(`《${book.title}》已删除`, 'info');
        }
    }

    showHomeworkTips() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        const homeworkTips = [
            {
                title: "制定作业计划",
                description: "每天放学后，先花10分钟制定作业计划，按重要程度排序",
                icon: "📝",
                time: "每天10分钟",
                difficulty: "简单"
            },
            {
                title: "番茄工作法",
                description: "专注学习25分钟，休息5分钟，提高学习效率",
                icon: "🍅",
                time: "每30分钟",
                difficulty: "中等"
            },
            {
                title: "整理笔记",
                description: "课后及时整理笔记，用不同颜色标注重点内容",
                icon: "📓",
                time: "每天15分钟",
                difficulty: "中等"
            },
            {
                title: "预习明天课程",
                description: "花15-20分钟预习明天要学习的内容",
                icon: "🔍",
                time: "每天20分钟",
                difficulty: "困难"
            }
        ];

        modalTitle.textContent = '作业技巧';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">✏️</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">高效作业技巧</h3>
                    <p class="text-gray-600">掌握科学方法，提高学习效率</p>
                </div>

                <!-- 当前作业状态 -->
                <div class="bg-blue-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-blue-800 mb-3">本周作业完成情况</h4>
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-sm text-blue-600">已完成作业</span>
                        <span class="text-sm font-semibold text-blue-800">${this.gameState.homeworkRecords?.filter(hw => hw.completed).length || 0} 次</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" style="width: ${Math.min(((this.gameState.homeworkRecords?.filter(hw => hw.completed).length || 0) / 5) * 100, 100)}%"></div>
                    </div>
                    <p class="text-xs text-blue-600 mt-2">本周目标：完成5次高质量作业</p>
                </div>

                <!-- 作业技巧列表 -->
                <div class="space-y-4">
                    ${homeworkTips.map(tip => `
                        <div class="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow">
                            <div class="flex items-start space-x-3">
                                <div class="text-3xl">${tip.icon}</div>
                                <div class="flex-1">
                                    <h4 class="font-semibold text-gray-800">${tip.title}</h4>
                                    <p class="text-sm text-gray-600 mt-1">${tip.description}</p>
                                    <div class="flex items-center space-x-3 mt-2">
                                        <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">${tip.time}</span>
                                        <span class="text-xs px-2 py-1 ${tip.difficulty === '简单' ? 'bg-green-100 text-green-800' : tip.difficulty === '中等' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'} rounded-full">${tip.difficulty}</span>
                                    </div>
                                </div>
                                <button onclick="game.practiceHomeworkSkill('${tip.title}')" class="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
                                    练习
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- 作业记录 -->
                <div class="bg-green-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-green-800 mb-3">今日作业记录</h4>
                    <div class="space-y-2">
                        ${this.gameState.homeworkRecords && this.gameState.homeworkRecords.length > 0 ?
                            this.gameState.homeworkRecords.filter(hw => this.isToday(hw.date)).map(record => `
                                <div class="bg-white p-3 rounded-lg flex items-center justify-between">
                                    <div>
                                        <div class="font-semibold text-gray-800">${record.subject}</div>
                                        <div class="text-xs text-gray-600">${record.description}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-semibold ${record.quality >= 4 ? 'text-green-600' : record.quality >= 3 ? 'text-yellow-600' : 'text-red-600'}">
                                            质量：${'⭐'.repeat(record.quality)}
                                        </div>
                                        <div class="text-xs text-gray-500">${record.duration}分钟</div>
                                    </div>
                                </div>
                            `).join('') :
                            '<p class="text-gray-600 text-center py-4">今天还没有记录作业</p>'
                        }
                    </div>
                    <button onclick="game.addHomeworkRecord()" class="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg text-sm w-full hover:bg-green-600 transition-colors">
                        <i class="fas fa-plus mr-2"></i>添加作业记录
                    </button>
                </div>

                <!-- 学习建议 -->
                <div class="bg-yellow-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-yellow-800 mb-2">
                        <i class="fas fa-lightbulb mr-2"></i>专家建议
                    </h4>
                    <div class="text-sm text-yellow-700 space-y-1">
                        <p>• 固定作业时间：每天同一时间做作业，形成良好习惯</p>
                        <p>• 准备学习用品：开始前准备好所有需要的材料</p>
                        <p> • 适当休息：每学习45分钟休息10分钟</p>
                        <p>• 及时检查：完成后认真检查，培养责任心</p>
                    </div>
                </div>

                <div class="text-center">
                    <button onclick="game.closeModal()" class="btn-primary">
                        关闭
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

  practiceHomeworkSkill(skillName) {
        // 模拟练习作业技巧
        this.showNotification(`开始练习"${skillName}"技巧`, 'info');

        // 给予少量奖励作为鼓励
        this.gameState.coins += 5;
        this.gameState.treeProgress += 3;

        this.updateUI();
        this.updateGrowthTree();
        this.saveGameState();

        setTimeout(() => {
            this.showNotification(`练习完成！继续保持，形成好习惯`, 'success');
        }, 2000);
    }

  addHomeworkRecord() {
        const subjects = ['语文', '数学', '英语', '科学', '美术', '音乐'];
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '添加作业记录';
        modalContent.innerHTML = `
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">科目</label>
                    <select id="homeworkSubject" class="w-full p-3 border border-gray-300 rounded-lg">
                        ${subjects.map(subject => `<option value="${subject}">${subject}</option>`).join('')}
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">作业内容</label>
                    <textarea id="homeworkDescription" placeholder="描述今天的作业内容..."
                              class="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">用时（分钟）</label>
                        <input type="number" id="homeworkDuration" placeholder="30" min="1"
                               class="w-full p-3 border border-gray-300 rounded-lg">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">质量评分</label>
                        <select id="homeworkQuality" class="w-full p-3 border border-gray-300 rounded-lg">
                            <option value="5">⭐⭐⭐⭐⭐ 优秀</option>
                            <option value="4">⭐⭐⭐⭐ 良好</option>
                            <option value="3">⭐⭐⭐ 一般</option>
                            <option value="2">⭐⭐ 需改进</option>
                            <option value="1">⭐ 不认真</option>
                        </select>
                    </div>
                </div>

                <div class="flex space-x-3">
                    <button onclick="game.closeModal()" class="btn-secondary flex-1">
                        取消
                    </button>
                    <button onclick="game.saveHomeworkRecord()" class="btn-primary flex-1">
                        保存
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

  saveHomeworkRecord() {
        const subject = document.getElementById('homeworkSubject').value;
        const description = document.getElementById('homeworkDescription').value.trim();
        const duration = document.getElementById('homeworkDuration').value;
        const quality = parseInt(document.getElementById('homeworkQuality').value);

        if (!subject || !description || !duration) {
            this.showNotification('请填写完整信息', 'warning');
            return;
        }

        if (!this.gameState.homeworkRecords) {
            this.gameState.homeworkRecords = [];
        }

        const record = {
            id: Date.now().toString(),
            subject: subject,
            description: description,
            duration: parseInt(duration),
            quality: quality,
            date: new Date().toISOString(),
            completed: true
        };

        this.gameState.homeworkRecords.push(record);

        // 根据质量给予奖励
        let coins = 10;
        let growth = 5;

        if (quality >= 4) {
            coins = 20;
            growth = 10;
        } else if (quality >= 3) {
            coins = 15;
            growth = 8;
        }

        this.gameState.coins += coins;
        this.gameState.treeProgress += growth;

        this.updateUI();
        this.updateGrowthTree();
        this.saveGameState();

        this.closeModal();
        this.showHomeworkTips(); // 刷新界面
        this.showNotification(`作业记录保存成功！获得${coins}金币奖励`, 'success');
    }

    showStudyProgress() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        // 计算学习统计数据
        const stats = this.calculateStudyStats();
        const weeklyData = this.getWeeklyStudyData();
        const categoryProgress = this.getCategoryProgress();

        modalTitle.textContent = '学习进度';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <!-- 总览统计 -->
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">📊</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">学习进度总览</h3>
                    <p class="text-gray-600">记录每一步成长的足迹</p>
                </div>

                <!-- 核心数据卡片 -->
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-600">${stats.totalFocusTime}</div>
                            <p class="text-sm text-gray-600">总专注时间(分钟)</p>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-green-600">${stats.studyStreak}</div>
                            <p class="text-sm text-gray-600">连续学习天数</p>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-purple-600">${stats.completedLessons}</div>
                            <p class="text-sm text-gray-600">完成课程数</p>
                        </div>
                    </div>
                    <div class="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-orange-600">${stats.avgFocusTime}</div>
                            <p class="text-sm text-gray-600">平均专注时间</p>
                        </div>
                    </div>
                </div>

                <!-- 本周学习趋势 -->
                <div class="bg-white p-4 rounded-xl border">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-chart-line mr-2 text-blue-500"></i>本周学习趋势
                    </h4>
                    <div class="space-y-2">
                        ${weeklyData.map((day, index) => `
                            <div class="flex items-center space-x-3">
                                <div class="w-16 text-sm text-gray-600">${day.name}</div>
                                <div class="flex-1 bg-gray-200 rounded-full h-6 relative">
                                    <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                         style="width: ${day.percentage}%">
                                        ${day.minutes > 0 ? `<span class="text-xs text-white font-semibold">${day.minutes}分钟</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mt-3 text-center">
                        <p class="text-sm text-gray-600">本周总计：<span class="font-semibold text-blue-600">${stats.weeklyTotal}分钟</span></p>
                    </div>
                </div>

                <!-- 学习分类进度 -->
                <div class="bg-white p-4 rounded-xl border">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-chart-pie mr-2 text-green-500"></i>分类学习进度
                    </h4>
                    <div class="space-y-3">
                        ${categoryProgress.map(category => `
                            <div>
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-sm text-gray-700">${category.name}</span>
                                    <span class="text-sm font-semibold">${category.completed}/${category.total}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-500"
                                         style="width: ${category.percentage}%"></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 学习目标 -->
                <div class="bg-yellow-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-yellow-800 mb-3">
                        <i class="fas fa-bullseye mr-2"></i>学习目标
                    </h4>
                    <div class="space-y-2">
                        ${this.gameState.studyGoals.length > 0 ?
                            this.gameState.studyGoals.slice(-3).map(goal => `
                                <div class="bg-white p-3 rounded-lg flex items-center justify-between">
                                    <div>
                                        <div class="font-semibold text-gray-800 text-sm">${goal.title}</div>
                                        <div class="text-xs text-gray-600">目标：${goal.target}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-semibold ${goal.completed ? 'text-green-600' : 'text-orange-600'}">
                                            ${goal.completed ? '已完成' : '进行中'}
                                        </div>
                                    </div>
                                </div>
                            `).join('') :
                            '<p class="text-gray-600 text-center py-4">还没有设定学习目标</p>'
                        }
                    </div>
                    <button onclick="game.showGoalSetting()" class="mt-3 bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm w-full hover:bg-yellow-600 transition-colors">
                        <i class="fas fa-plus mr-2"></i>设定学习目标
                    </button>
                </div>

                <!-- 学习建议 -->
                <div class="bg-blue-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-blue-800 mb-2">
                        <i class="fas fa-lightbulb mr-2"></i>AI学习建议
                    </h4>
                    <div class="text-sm text-blue-700 space-y-1">
                        ${this.generateStudyAdvice(stats)}
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="flex space-x-3">
                    <button onclick="game.showDetailedStats()" class="btn-secondary flex-1">
                        <i class="fas fa-chart-bar mr-2"></i>详细统计
                    </button>
                    <button onclick="game.exportStudyReport()" class="btn-primary flex-1">
                        <i class="fas fa-download mr-2"></i>导出报告
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

    calculateStudyStats() {
        const totalFocusTime = this.calculateTotalFocusTime();
        const moralLessons = this.gameState.moralLessonsCompleted || 0;
        const lifeSkills = this.gameState.lifeSkillsCompleted || 0;
        const completedLessons = moralLessons + lifeSkills;

        // 计算连续学习天数
        const studyStreak = this.calculateStudyStreak();

        // 计算平均专注时间
        const focusSessions = this.gameState.focusStats || [];
        const avgFocusTime = focusSessions.length > 0 ?
            Math.round(focusSessions.reduce((sum, session) => sum + session.duration, 0) / focusSessions.length) : 0;

        // 计算本周总学习时间
        const weeklyTotal = this.getWeeklyTotal();

        return {
            totalFocusTime,
            studyStreak,
            completedLessons,
            avgFocusTime,
            weeklyTotal
        };
    }

    getWeeklyStudyData() {
        const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        const today = new Date();
        const weekData = [];

        const focusStats = this.gameState.focusStats || [];
        const maxMinutes = Math.max(...weekDays.map((_, index) => {
            const date = new Date(today);
            date.setDate(date.getDate() - date.getDay() + index + 1);
            const dayKey = date.toDateString();

            return focusStats
                .filter(stat => new Date(stat.date).toDateString() === dayKey)
                .reduce((sum, stat) => sum + stat.duration, 0);
        }), 1);

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - today.getDay() + i + 1);
            const dayKey = date.toDateString();

            const dayMinutes = focusStats
                .filter(stat => new Date(stat.date).toDateString() === dayKey)
                .reduce((sum, stat) => sum + stat.duration, 0);

            weekData.push({
                name: weekDays[i],
                minutes: dayMinutes,
                percentage: Math.round((dayMinutes / maxMinutes) * 100)
            });
        }

        return weekData;
    }

    getCategoryProgress() {
        const categories = [
            { name: '品德培养', key: 'moral', color: 'from-purple-400 to-purple-600' },
            { name: '生活技能', key: 'lifeSkills', color: 'from-green-400 to-green-600' },
            { name: '专注训练', key: 'focus', color: 'from-blue-400 to-blue-600' },
            { name: '每日任务', key: 'tasks', color: 'from-orange-400 to-orange-600' }
        ];

        return categories.map(category => {
            let completed = 0;
            let total = 20; // 假设每个分类的目标是20个

            switch(category.key) {
                case 'moral':
                    completed = this.gameState.moralLessonsCompleted || 0;
                    break;
                case 'lifeSkills':
                    completed = this.gameState.lifeSkillsCompleted || 0;
                    break;
                case 'focus':
                    completed = (this.gameState.focusStats || []).length;
                    break;
                case 'tasks':
                    completed = this.gameState.completedTasks.length;
                    break;
            }

            return {
                ...category,
                completed,
                total,
                percentage: Math.round((completed / total) * 100)
            };
        });
    }

    calculateStudyStreak() {
        const focusStats = this.gameState.focusStats || [];
        if (focusStats.length === 0) return 0;

        // 获取最近的学习日期
        const studyDates = [...new Set(focusStats.map(stat =>
            new Date(stat.date).toDateString()
        ))].sort((a, b) => new Date(b) - new Date(a));

        let streak = 0;
        const today = new Date().toDateString();

        for (let i = 0; i < studyDates.length; i++) {
            const currentDate = new Date(studyDates[i]);
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - i);

            if (currentDate.toDateString() === expectedDate.toDateString()) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    getWeeklyTotal() {
        const focusStats = this.gameState.focusStats || [];
        const today = new Date();
        let weeklyTotal = 0;

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - today.getDay() + i + 1);
            const dayKey = date.toDateString();

            weeklyTotal += focusStats
                .filter(stat => new Date(stat.date).toDateString() === dayKey)
                .reduce((sum, stat) => sum + stat.duration, 0);
        }

        return weeklyTotal;
    }

    generateStudyAdvice(stats) {
        const advice = [];

        if (stats.totalFocusTime < 60) {
            advice.push('💡 建议每天至少进行10分钟的专注学习');
        }

        if (stats.avgFocusTime < 15) {
            advice.push('📈 可以逐步增加专注时间，提高学习效率');
        }

        if (stats.studyStreak >= 7) {
            advice.push('🔥 连续学习很棒！保持这个良好习惯');
        }

        if (stats.weeklyTotal < 150) {
            advice.push('📚 本周学习时间较少，建议增加学习频率');
        }

        const moralLessons = this.gameState.moralLessonsCompleted || 0;
        const lifeSkills = this.gameState.lifeSkillsCompleted || 0;

        if (moralLessons > lifeSkills + 3) {
            advice.push('🏠 在品德学习的同时，也可以多练习生活技能');
        }

        if (lifeSkills > moralLessons + 3) {
            advice.push('⭐ 生活技能进步很大！继续加强品德培养');
        }

        if (advice.length === 0) {
            advice.push('🌟 学习状态很好！继续保持这个节奏');
            advice.push('🎯 可以尝试设定新的学习目标挑战自己');
        }

        return advice.map(item => `<div>${item}</div>`).join('');
    }

    showTaskSettings() {
        this.showNotification('任务设置功能开发中...', 'info');
    }

    showTimeControl() {
        this.showNotification('时间控制功能开发中...', 'info');
    }

    showEducationGuide() {
        this.showNotification('教育指导功能开发中...', 'info');
    }

    showProfile() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        // 计算统计数据
        const totalTasks = this.gameState.completedTasks.length;
        const totalFocusTime = this.calculateTotalFocusTime();
        const moralLessons = this.gameState.moralLessonsCompleted || 0;
        const lifeSkillsLessons = this.gameState.lifeSkillsCompleted || 0;

        modalTitle.textContent = '个人资料';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">👤</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">我的成长档案</h3>
                    <p class="text-gray-600">记录每一个成长瞬间</p>
                </div>

                <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                    <h4 class="font-semibold text-gray-800 mb-4">基本数据</h4>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-blue-600">${this.gameState.treeLevel}</div>
                            <p class="text-sm text-gray-600">成长树等级</p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-green-600">${this.gameState.consecutiveDays}</div>
                            <p class="text-sm text-gray-600">连续天数</p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-yellow-600">${this.gameState.coins}</div>
                            <p class="text-sm text-gray-600">总金币</p>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-purple-600">${this.gameState.achievements.length}</div>
                            <p class="text-sm text-gray-600">获得成就</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-xl border">
                    <h4 class="font-semibold text-gray-800 mb-3">学习统计</h4>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">完成任务</span>
                            <span class="text-sm font-semibold">${totalTasks} 个</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">专注学习</span>
                            <span class="text-sm font-semibold">${totalFocusTime} 分钟</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">品德课程</span>
                            <span class="text-sm font-semibold">${moralLessons} 节</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-600">生活技能</span>
                            <span class="text-sm font-semibold">${lifeSkillsLessons} 个</span>
                        </div>
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-green-800 mb-2">
                        <i class="fas fa-trophy mr-2"></i>成长等级
                    </h4>
                    <div class="flex items-center space-x-3">
                        <div class="flex-1 bg-gray-200 rounded-full h-3">
                            <div class="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" style="width: ${Math.min((this.gameState.treeLevel / 10) * 100, 100)}%"></div>
                        </div>
                        <span class="text-sm font-semibold text-green-700">Lv.${this.gameState.treeLevel}</span>
                    </div>
                    <p class="text-xs text-green-600 mt-2">继续努力，解锁更多成就！</p>
                </div>

                <div class="text-center">
                    <button onclick="game.exportReport()" class="btn-primary">
                        <i class="fas fa-download mr-2"></i>导出成长报告
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

    showFamilyMembers() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '家庭成员';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">👨‍👩‍👧‍👦</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">家庭成员管理</h3>
                    <p class="text-gray-600">添加家庭成员，共同成长</p>
                </div>

                <div class="bg-blue-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-blue-800 mb-3">当前家庭成员</h4>
                    <div class="space-y-2">
                        ${this.gameState.familyMembers.length > 0 ?
                            this.gameState.familyMembers.map(member => `
                                <div class="bg-white p-3 rounded-lg flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div class="text-2xl">${member.avatar}</div>
                                        <div>
                                            <div class="font-semibold text-gray-800">${member.name}</div>
                                            <div class="text-xs text-gray-600">${member.role}</div>
                                        </div>
                                    </div>
                                    <button onclick="game.removeFamilyMember('${member.id}')" class="text-red-500 hover:text-red-700">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `).join('') :
                            '<p class="text-gray-600 text-center py-4">还没有添加家庭成员</p>'
                        }
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-green-800 mb-3">添加家庭成员</h4>
                    <div class="space-y-3">
                        <input type="text" id="memberName" placeholder="成员姓名"
                               class="w-full p-3 border border-gray-300 rounded-lg">
                        <select id="memberRole" class="w-full p-3 border border-gray-300 rounded-lg">
                            <option value="">选择角色</option>
                            <option value="爸爸">爸爸</option>
                            <option value="妈妈">妈妈</option>
                            <option value="孩子">孩子</option>
                            <option value="爷爷">爷爷</option>
                            <option value="奶奶">奶奶</option>
                            <option value="其他">其他</option>
                        </select>
                        <div class="grid grid-cols-6 gap-2">
                            ${['👨', '👩', '👧', '👦', '👴', '👵', '🧒', '👶'].map(avatar =>
                                `<button onclick="game.selectAvatar('${avatar}')" class="avatar-btn p-2 border rounded hover:bg-blue-100" data-avatar="${avatar}">${avatar}</button>`
                            ).join('')}
                        </div>
                        <input type="hidden" id="selectedAvatar" value="">
                        <button onclick="game.addFamilyMember()" class="btn-primary w-full">
                            <i class="fas fa-plus mr-2"></i>添加成员
                        </button>
                    </div>
                </div>

                <div class="bg-yellow-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-yellow-800 mb-2">
                        <i class="fas fa-lightbulb mr-2"></i>家庭协作建议
                    </h4>
                    <ul class="text-sm text-yellow-700 space-y-1">
                        <li>• 每天设定一个家庭共同任务</li>
                        <li>• 定期召开家庭会议，分享学习心得</li>
                        <li>• 互相鼓励，共同完成成长目标</li>
                    </ul>
                </div>
            </div>
        `;

        this.openModal();
    }

    selectAvatar(avatar) {
        document.getElementById('selectedAvatar').value = avatar;
        document.querySelectorAll('.avatar-btn').forEach(btn => {
            btn.classList.remove('bg-blue-100', 'border-blue-500');
            btn.classList.add('border-gray-300');
        });
        event.target.classList.remove('border-gray-300');
        event.target.classList.add('bg-blue-100', 'border-blue-500');
    }

    addFamilyMember() {
        const name = document.getElementById('memberName').value.trim();
        const role = document.getElementById('memberRole').value;
        const avatar = document.getElementById('selectedAvatar').value;

        if (!name || !role || !avatar) {
            this.showNotification('请填写完整信息', 'warning');
            return;
        }

        const member = {
            id: Date.now().toString(),
            name: name,
            role: role,
            avatar: avatar,
            joinDate: new Date().toISOString()
        };

        this.gameState.familyMembers.push(member);
        this.saveGameState();
        this.showFamilyMembers(); // 刷新界面
        this.showNotification(`${name} 已加入家庭！`, 'success');
    }

    removeFamilyMember(memberId) {
        if (confirm('确定要移除这个家庭成员吗？')) {
            this.gameState.familyMembers = this.gameState.familyMembers.filter(m => m.id !== memberId);
            this.saveGameState();
            this.showFamilyMembers(); // 刷新界面
            this.showNotification('家庭成员已移除', 'info');
        }
    }

    showSettings() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '设置';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">⚙️</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">游戏设置</h3>
                    <p class="text-gray-600">个性化你的游戏体验</p>
                </div>

                <div class="bg-blue-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-blue-800 mb-3">
                        <i class="fas fa-volume-up mr-2"></i>音效设置
                    </h4>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-700">音效开关</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="soundEnabled" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-700">音量大小</span>
                            <input type="range" id="soundVolume" min="0" max="100" value="70" class="w-24">
                        </div>
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-green-800 mb-3">
                        <i class="fas fa-clock mr-2"></i>时间管理
                    </h4>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-700">每日游戏时长限制</span>
                            <select id="dailyTimeLimit" class="p-2 border rounded text-sm">
                                <option value="30">30分钟</option>
                                <option value="60" selected>1小时</option>
                                <option value="120">2小时</option>
                                <option value="0">不限制</option>
                            </select>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-700">夜间模式</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="nightMode" class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="bg-purple-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-purple-800 mb-3">
                        <i class="fas fa-child mr-2"></i>儿童模式
                    </h4>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-700">启用儿童保护</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="childMode" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm text-gray-700">简化界面</span>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="simpleUI" class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="bg-yellow-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-yellow-800 mb-3">
                        <i class="fas fa-database mr-2"></i>数据管理
                    </h4>
                    <div class="space-y-3">
                        <button onclick="game.exportReport()" class="btn-secondary w-full">
                            <i class="fas fa-download mr-2"></i>导出游戏数据
                        </button>
                        <button onclick="game.resetGameData()" class="bg-red-500 text-white px-4 py-2 rounded-lg w-full hover:bg-red-600 transition-colors">
                            <i class="fas fa-redo mr-2"></i>重置游戏数据
                        </button>
                    </div>
                </div>

                <div class="text-center text-xs text-gray-500">
                    <p>家庭成长乐园 v1.0</p>
                    <p>让成长更快乐，让教育更有趣</p>
                </div>
            </div>
        `;

        this.openModal();
    }

    resetGameData() {
        if (confirm('确定要重置所有游戏数据吗？此操作不可恢复！')) {
            localStorage.removeItem('familyGrowthGame');
            location.reload();
        }
    }

    // 学习目标设定功能
    showGoalSetting() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = '设定学习目标';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">🎯</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">设定学习目标</h3>
                    <p class="text-gray-600">制定目标，让学习更有方向</p>
                </div>

                <div class="bg-blue-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-blue-800 mb-3">创建新目标</h4>
                    <div class="space-y-3">
                        <input type="text" id="goalTitle" placeholder="目标名称（如：每日阅读）"
                               class="w-full p-3 border border-gray-300 rounded-lg">
                        <textarea id="goalDescription" placeholder="目标描述（如：每天阅读30分钟课外书）"
                                  class="w-full p-3 border border-gray-300 rounded-lg h-20 resize-none"></textarea>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="text-sm text-gray-600">目标类型</label>
                                <select id="goalType" class="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="daily">每日目标</option>
                                    <option value="weekly">每周目标</option>
                                    <option value="monthly">每月目标</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-sm text-gray-600">目标数值</label>
                                <input type="number" id="goalTarget" placeholder="如：30" min="1"
                                       class="w-full p-2 border border-gray-300 rounded-lg">
                            </div>
                        </div>
                        <button onclick="game.addStudyGoal()" class="btn-primary w-full">
                            <i class="fas fa-plus mr-2"></i>添加目标
                        </button>
                    </div>
                </div>

                <div class="bg-green-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-green-800 mb-3">当前目标</h4>
                    <div class="space-y-2">
                        ${this.gameState.studyGoals.length > 0 ?
                            this.gameState.studyGoals.map(goal => `
                                <div class="bg-white p-3 rounded-lg">
                                    <div class="flex items-center justify-between mb-2">
                                        <div class="font-semibold text-gray-800">${goal.title}</div>
                                        <div class="flex space-x-2">
                                            <button onclick="game.completeGoal('${goal.id}')" class="text-green-500 hover:text-green-700">
                                                <i class="fas fa-check"></i>
                                            </button>
                                            <button onclick="game.deleteGoal('${goal.id}')" class="text-red-500 hover:text-red-700">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="text-sm text-gray-600">${goal.description}</div>
                                    <div class="flex items-center justify-between mt-2">
                                        <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">${goal.type}</span>
                                        <span class="text-sm text-gray-500">目标：${goal.target}</span>
                                    </div>
                                </div>
                            `).join('') :
                            '<p class="text-gray-600 text-center py-4">还没有设定学习目标</p>'
                        }
                    </div>
                </div>
            </div>
        `;

        this.openModal();
    }

    addStudyGoal() {
        const title = document.getElementById('goalTitle').value.trim();
        const description = document.getElementById('goalDescription').value.trim();
        const type = document.getElementById('goalType').value;
        const target = document.getElementById('goalTarget').value;

        if (!title || !description || !target) {
            this.showNotification('请填写完整信息', 'warning');
            return;
        }

        const goal = {
            id: Date.now().toString(),
            title: title,
            description: description,
            type: type,
            target: target,
            completed: false,
            createdDate: new Date().toISOString()
        };

        this.gameState.studyGoals.push(goal);
        this.saveGameState();
        this.showGoalSetting(); // 刷新界面
        this.showNotification('学习目标添加成功', 'success');
    }

    completeGoal(goalId) {
        const goal = this.gameState.studyGoals.find(g => g.id === goalId);
        if (goal) {
            goal.completed = true;
            goal.completedDate = new Date().toISOString();

            // 给予奖励
            this.gameState.coins += 15;
            this.gameState.treeProgress += 8;

            this.updateUI();
            this.updateGrowthTree();
            this.saveGameState();
            this.showGoalSetting(); // 刷新界面
            this.showNotification('目标完成！获得15金币', 'success');
        }
    }

    deleteGoal(goalId) {
        if (confirm('确定要删除这个目标吗？')) {
            this.gameState.studyGoals = this.gameState.studyGoals.filter(g => g.id !== goalId);
            this.saveGameState();
            this.showGoalSetting(); // 刷新界面
            this.showNotification('目标已删除', 'info');
        }
    }

    // 详细统计功能
    showDetailedStats() {
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        // 计算详细统计数据
        const stats = this.calculateDetailedStats();
        const monthlyData = this.getMonthlyData();
        const categoryBreakdown = this.getCategoryBreakdown();

        modalTitle.textContent = '详细统计';
        modalContent.innerHTML = `
            <div class="space-y-6">
                <div class="text-center mb-6">
                    <div class="text-6xl mb-3">📊</div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">详细学习统计</h3>
                    <p class="text-gray-600">深入了解学习数据</p>
                </div>

                <!-- 时间分布统计 -->
                <div class="bg-white p-4 rounded-xl border">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-clock mr-2 text-blue-500"></i>学习时间分布
                    </h4>
                    <div class="space-y-3">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-600">${stats.morningTime}</div>
                                <p class="text-xs text-gray-600">上午(6-12点)</p>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-orange-600">${stats.afternoonTime}</div>
                                <p class="text-xs text-gray-600">下午(12-18点)</p>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-purple-600">${stats.eveningTime}</div>
                                <p class="text-xs text-gray-600">晚上(18-24点)</p>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-indigo-600">${stats.nightTime}</div>
                                <p class="text-xs text-gray-600">深夜(0-6点)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 月度趋势 -->
                <div class="bg-white p-4 rounded-xl border">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-calendar-alt mr-2 text-green-500"></i>月度学习趋势
                    </h4>
                    <div class="space-y-2">
                        ${monthlyData.map(month => `
                            <div class="flex items-center space-x-3">
                                <div class="w-16 text-sm text-gray-600">${month.name}</div>
                                <div class="flex-1 bg-gray-200 rounded-full h-6 relative">
                                    <div class="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                                         style="width: ${month.percentage}%">
                                        ${month.minutes > 0 ? `<span class="text-xs text-white font-semibold">${month.minutes}分钟</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 分类详细数据 -->
                <div class="bg-white p-4 rounded-xl border">
                    <h4 class="font-semibold text-gray-800 mb-3">
                        <i class="fas fa-th-list mr-2 text-purple-500"></i>分类详细数据
                    </h4>
                    <div class="space-y-3">
                        ${categoryBreakdown.map(category => `
                            <div class="bg-gray-50 p-3 rounded-lg">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="font-semibold text-gray-800">${category.name}</span>
                                    <span class="text-sm font-semibold text-${category.color}-600">${category.count} 次</span>
                                </div>
                                <div class="text-sm text-gray-600">
                                    总时长：${category.totalMinutes}分钟 | 平均：${category.avgMinutes}分钟
                                </div>
                                <div class="text-xs text-gray-500 mt-1">
                                    最近活动：${category.lastActivity}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 学习效率分析 -->
                <div class="bg-yellow-50 p-4 rounded-xl">
                    <h4 class="font-semibold text-yellow-800 mb-3">
                        <i class="fas fa-chart-line mr-2"></i>学习效率分析
                    </h4>
                    <div class="space-y-2 text-sm text-yellow-700">
                        <div>• 最佳学习时段：${stats.bestTimeSlot}</div>
                        <div>• 平均专注效率：${stats.efficiency}%</div>
                        <div>• 学习稳定性：${stats.stability}</div>
                        <div>• 建议改进：${stats.suggestion}</div>
                    </div>
                </div>

                <div class="text-center">
                    <button onclick="game.closeModal()" class="btn-primary">
                        关闭
                    </button>
                </div>
            </div>
        `;

        this.openModal();
    }

    calculateDetailedStats() {
        const focusStats = this.gameState.focusStats || [];
        const stats = {
            morningTime: 0,
            afternoonTime: 0,
            eveningTime: 0,
            nightTime: 0,
            bestTimeSlot: '上午',
            efficiency: 85,
            stability: '良好',
            suggestion: '保持当前学习节奏'
        };

        focusStats.forEach(stat => {
            const hour = new Date(stat.date).getHours();
            if (hour >= 6 && hour < 12) {
                stats.morningTime += stat.duration;
            } else if (hour >= 12 && hour < 18) {
                stats.afternoonTime += stat.duration;
            } else if (hour >= 18 && hour < 24) {
                stats.eveningTime += stat.duration;
            } else {
                stats.nightTime += stat.duration;
            }
        });

        // 找出最佳学习时段
        const timeSlots = [
            { name: '上午', time: stats.morningTime },
            { name: '下午', time: stats.afternoonTime },
            { name: '晚上', time: stats.eveningTime },
            { name: '深夜', time: stats.nightTime }
        ];
        stats.bestTimeSlot = timeSlots.reduce((a, b) => a.time > b.time ? a : b).name;

        return stats;
    }

    getMonthlyData() {
        const months = ['一月', '二月', '三月', '四月', '五月', '六月'];
        const focusStats = this.gameState.focusStats || [];
        const monthlyData = [];

        const maxMinutes = Math.max(...months.map((_, index) => {
            return focusStats
                .filter(stat => new Date(stat.date).getMonth() === index)
                .reduce((sum, stat) => sum + stat.duration, 0);
        }), 1);

        for (let i = 0; i < 6; i++) {
            const monthMinutes = focusStats
                .filter(stat => new Date(stat.date).getMonth() === i)
                .reduce((sum, stat) => sum + stat.duration, 0);

            monthlyData.push({
                name: months[i],
                minutes: monthMinutes,
                percentage: Math.round((monthMinutes / maxMinutes) * 100)
            });
        }

        return monthlyData;
    }

    getCategoryBreakdown() {
        const categories = [
            { name: '专注训练', key: 'focus', color: 'blue' },
            { name: '品德课程', key: 'moral', color: 'purple' },
            { name: '生活技能', key: 'lifeSkills', color: 'green' },
            { name: '每日任务', key: 'tasks', color: 'orange' }
        ];

        return categories.map(category => {
            let count = 0;
            let totalMinutes = 0;
            let lastActivity = '暂无记录';

            switch(category.key) {
                case 'focus':
                    count = (this.gameState.focusStats || []).length;
                    totalMinutes = this.calculateTotalFocusTime();
                    if (this.gameState.focusStats && this.gameState.focusStats.length > 0) {
                        const lastStat = this.gameState.focusStats[this.gameState.focusStats.length - 1];
                        lastActivity = new Date(lastStat.date).toLocaleDateString('zh-CN');
                    }
                    break;
                case 'moral':
                    count = this.gameState.moralLessonsCompleted || 0;
                    totalMinutes = count * 15; // 假设每节课程15分钟
                    break;
                case 'lifeSkills':
                    count = this.gameState.lifeSkillsCompleted || 0;
                    totalMinutes = count * 20; // 假设每个技能20分钟
                    break;
                case 'tasks':
                    count = this.gameState.completedTasks.length;
                    totalMinutes = count * 10; // 假设每个任务10分钟
                    break;
            }

            return {
                ...category,
                count,
                totalMinutes,
                avgMinutes: count > 0 ? Math.round(totalMinutes / count) : 0,
                lastActivity
            };
        });
    }

    // 导出学习报告功能
    exportStudyReport() {
        const stats = this.calculateStudyStats();
        const detailedStats = this.calculateDetailedStats();
        const monthlyData = this.getMonthlyData();
        const categoryBreakdown = this.getCategoryBreakdown();

        const report = {
            exportDate: new Date().toLocaleString('zh-CN'),
            basicStats: {
                treeLevel: this.gameState.treeLevel,
                totalCoins: this.gameState.coins,
                consecutiveDays: this.gameState.consecutiveDays,
                achievements: this.gameState.achievements.length
            },
            studyStats: stats,
            timeDistribution: {
                morning: detailedStats.morningTime,
                afternoon: detailedStats.afternoonTime,
                evening: detailedStats.eveningTime,
                night: detailedStats.nightTime,
                bestTimeSlot: detailedStats.bestTimeSlot
            },
            monthlyData: monthlyData,
            categoryBreakdown: categoryBreakdown,
            completedTasks: this.gameState.completedTasks.length,
            studyGoals: this.gameState.studyGoals.filter(g => g.completed).length,
            totalStudyGoals: this.gameState.studyGoals.length
        };

        const reportText = `
家庭成长乐园 - 详细学习报告
=============================

导出时间：${report.exportDate}

【基本数据】
成长树等级：${report.basicStats.treeLevel}
总金币数量：${report.basicStats.totalCoins}
连续登录天数：${report.basicStats.consecutiveDays}
获得成就数量：${report.basicStats.achievements}

【学习统计】
总专注时间：${report.studyStats.totalFocusTime} 分钟
连续学习天数：${report.studyStats.studyStreak} 天
完成课程总数：${report.studyStats.completedLessons}
平均专注时间：${report.studyStats.avgFocusTime} 分钟
本周学习时间：${report.studyStats.weeklyTotal} 分钟

【时间分布】
上午学习：${report.timeDistribution.morning} 分钟
下午学习：${report.timeDistribution.afternoon} 分钟
晚上学习：${report.timeDistribution.evening} 分钟
深夜学习：${report.timeDistribution.night} 分钟
最佳学习时段：${report.timeDistribution.bestTimeSlot}

【月度趋势】
${report.monthlyData.map(month => `${month.name}：${month.minutes} 分钟`).join('\n')}

【分类数据】
${report.categoryBreakdown.map(cat =>
    `${cat.name}：${cat.count} 次，总时长 ${cat.totalMinutes} 分钟，平均 ${cat.avgMinutes} 分钟`
).join('\n')}

【目标完成】
已完成任务：${report.completedTasks} 个
学习目标完成：${report.studyGoals}/${report.totalStudyGoals} 个

【分析建议】
最佳学习时段：${report.timeDistribution.bestTimeSlot}
学习效率：${detailedStats.efficiency}%
学习稳定性：${detailedStats.stability}
建议：${detailedStats.suggestion}

继续加油，快乐成长！
        `;

        // 创建下载链接
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `学习报告_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('学习报告已导出', 'success');
    }
}

// 初始化游戏
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new FamilyGrowthGame();

    // 创建全局函数供HTML调用
    window.showSection = (sectionName) => game.showSection(sectionName);
    window.toggleMenu = () => game.toggleMenu();
    window.closeModal = () => game.closeModal();
});

// 防止页面缩放
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);