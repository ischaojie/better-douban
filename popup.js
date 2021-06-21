
// 获取 changeColor button
let ChangeColor = document.getElementById("changeColor");

// 设置当前按钮背景
chrome.storage.sync.get("color", ({
    color
}) => {
    ChangeColor.style.backgroundColor = color;
});

// 给 popup 的 button 添加 click 事件
ChangeColor.addEventListener("click", async () => {
    // chrome api 获取当前 tab
    let [tab] = await chrome.tabs.query({active:true, currentWindow: true});

    // 执行 脚本 注入
    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: setPageBackgroundColor,
    });
});

function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({
        color
    }) => {
        // 设置页面背景
        document.body.style.backgroundColor = color;
    });
}