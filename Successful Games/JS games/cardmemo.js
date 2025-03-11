// memoryGame.js

// 全局变量设置
const fruits = ["🍎", "🍌", "🍇", "🍊", "🍉", "🍍", "🍑", "🍒"];
let cards = [];
let firstCard = null;
let lockBoard = false;
let currentTeam = "red"; // "red" 或 "blue"
let currentPlayerIndex = 0; // 0 表示队员1号，1 表示队员2号
let redFlips = [0, 0]; // 红队两位玩家的翻转次数
let blueFlips = [0, 0]; // 蓝队两位玩家的翻转次数
let matchedCount = 0;
const totalCards = 16;

// 洗牌函数（Fisher-Yates 算法）
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 初始化卡牌面板
function initBoard() {
  // 将8种水果各复制一次，组成16张卡牌
  const fruitPairs = fruits.concat(fruits);
  const shuffledFruits = shuffle(fruitPairs.slice());
  cards = [];
  matchedCount = 0;
  const boardDiv = document.getElementById("gameBoard");
  boardDiv.innerHTML = "";

  for (let i = 0; i < totalCards; i++) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.fruit = shuffledFruits[i];
    card.dataset.flipped = "false";
    // 生成正反两面的结构，正面显示水果，背面显示笑脸
    card.innerHTML = `
      <div class="face back">🙂</div>
      <div class="face front">${card.dataset.fruit}</div>
    `;
    card.addEventListener("click", onCardClick);
    boardDiv.appendChild(card);
  }
}

// 卡牌点击事件处理
function onCardClick(e) {
  if (lockBoard) return;
  const card = e.currentTarget;
  if (card.dataset.flipped === "true") return; // 已翻开或已匹配的卡牌不响应

  flipCard(card);

  // 增加当前玩家的翻转次数
  if (currentTeam === "red") {
    redFlips[currentPlayerIndex]++;
  } else {
    blueFlips[currentPlayerIndex]++;
  }
  updateFlipCountInfo();

  if (!firstCard) {
    firstCard = card;
    return;
  }
  // 避免重复点击同一张卡牌
  if (card === firstCard) return;

  // 检查两张卡牌是否匹配
  if (card.dataset.fruit === firstCard.dataset.fruit) {
    // 匹配成功，标记已匹配
    card.dataset.matched = "true";
    firstCard.dataset.matched = "true";
    firstCard = null;
    matchedCount += 2;
    if (matchedCount === totalCards) {
      // 当前队完成，延时后结束本局
      setTimeout(endRound, 500);
    }
    // 同一玩家继续操作
  } else {
    // 未匹配成功，延时后翻回背面，并切换到本队下一位玩家
    lockBoard = true;
    setTimeout(() => {
      unflipCard(card);
      unflipCard(firstCard);
      firstCard = null;
      lockBoard = false;
      switchPlayer();
    }, 1000);
  }
}

// 翻牌：添加 flipped 类，触发 CSS 翻转动画
function flipCard(card) {
  card.classList.add("flipped");
  card.dataset.flipped = "true";
}

// 还原牌面：移除 flipped 类
function unflipCard(card) {
  card.classList.remove("flipped");
  card.dataset.flipped = "false";
}

// 更新当前队伍和玩家信息显示
function updateGameInfo() {
  const teamInfo = document.getElementById("teamInfo");
  const playerInfo = document.getElementById("playerInfo");
  if (currentTeam === "red") {
    teamInfo.innerText = "当前队伍：红队";
    playerInfo.innerText = "当前玩家：红队" + (currentPlayerIndex + 1) + "号";
  } else {
    teamInfo.innerText = "当前队伍：蓝队";
    playerInfo.innerText = "当前玩家：蓝队" + (currentPlayerIndex + 1) + "号";
  }
}

// 更新翻转次数显示
function updateFlipCountInfo() {
  const flipCountInfo = document.getElementById("flipCountInfo");
  if (currentTeam === "red") {
    flipCountInfo.innerText = "红队1号：" + redFlips[0] + " 次，红队2号：" + redFlips[1] + " 次";
  } else {
    flipCountInfo.innerText = "蓝队1号：" + blueFlips[0] + " 次，蓝队2号：" + blueFlips[1] + " 次";
  }
}

// 切换到当前队伍的下一位玩家
function switchPlayer() {
  currentPlayerIndex = (currentPlayerIndex + 1) % 2;
  updateGameInfo();
}

// 当所有卡牌匹配完毕，结束当前队伍回合
function endRound() {
  if (currentTeam === "red") {
    alert("红队完成！总翻转次数：" + (redFlips[0] + redFlips[1]) + " 次");
    // 切换到蓝队回合
    currentTeam = "blue";
    currentPlayerIndex = 0;
    initBoard();
    updateGameInfo();
    updateFlipCountInfo();
  } else {
    alert("蓝队完成！总翻转次数：" + (blueFlips[0] + blueFlips[1]) + " 次");
    // 两队均完成后显示结果
    showResult();
  }
}

// 显示比赛结果和惩罚选项
function showResult() {
  const redTotal = redFlips[0] + redFlips[1];
  const blueTotal = blueFlips[0] + blueFlips[1];
  const resultScreen = document.getElementById("resultScreen");
  resultScreen.style.display = "block";
  document.getElementById("gameScreen").style.display = "none";
  let resultText = "";
  if (redTotal < blueTotal) {
    resultText = "红队获胜！红队总翻转次数：" + redTotal + " 次，蓝队总翻转次数：" + blueTotal + " 次。请选择惩罚：";
  } else if (blueTotal < redTotal) {
    resultText = "蓝队获胜！蓝队总翻转次数：" + blueTotal + " 次，红队总翻转次数：" + redTotal + " 次。请选择惩罚：";
  } else {
    resultText = "平局！红队总翻转次数：" + redTotal + " 次，蓝队总翻转次数：" + blueTotal + " 次。请选择惩罚：";
  }
  document.getElementById("resultText").innerText = resultText;
  document.getElementById("penaltyOptions").style.display = "block";
}

// 惩罚选项点击处理
function onPenaltySelected(e) {
  const penalty = e.currentTarget.dataset.penalty;
  alert("选择惩罚：" + penalty);
  // 显示 Restart 按钮
  document.getElementById("restartButton").style.display = "block";
  document.getElementById("penaltyOptions").style.display = "none";
}

// 重置游戏，返回初始界面
function restartGame() {
  currentTeam = "red";
  currentPlayerIndex = 0;
  redFlips = [0, 0];
  blueFlips = [0, 0];
  firstCard = null;
  lockBoard = false;
  matchedCount = 0;
  document.getElementById("resultScreen").style.display = "none";
  document.getElementById("restartButton").style.display = "none";
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("welcomeScreen").style.display = "block";
}

// 为所有惩罚按钮添加点击事件监听
document.querySelectorAll(".penaltyButton").forEach(btn => {
  btn.addEventListener("click", onPenaltySelected);
});

// Restart 按钮事件监听
document.getElementById("restartButton").addEventListener("click", restartGame);

// Start Game 按钮事件监听
document.getElementById("startGameButton").addEventListener("click", function(){
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  initBoard();
  updateGameInfo();
  updateFlipCountInfo();
});
