# 地圖設計稿

未放入 app。下一輪先跟呢份稿改。

地圖用你畀嘅四張設計圖，唔再另外砌一套米色卡片代替張圖。

| 用喺邊 | 圖 |
| --- | --- |
| 手機打開地圖，預設呢張 | `content/map-direction/03-vertical-phone.jpg` |
| 左右掃睇成條路 | `content/map-direction/01-panorama.jpg` |
| 進度總覽、月結底 | `content/map-direction/02-journey-cards.jpg` |
| 首頁入口縮圖 | `content/map-direction/04-thumbnail-path.jpg` |

圖入面嘅屋、港鐵、學校、過節、貓、小路、路牌、窗燈，就係地圖。圖上面印住嘅英文假頂欄（Lazy Cat English、Where have we been?）唔搬入 app。app 留返自己嘅頂欄同底欄，心心同每日目標保持不變。

預覽：打開 `content/map-design/board.html`。

## 四區

由上到下（手機），或者由左到右（全景）：

| 區 | 圖入面 | 路牌 |
| --- | --- | --- |
| 屋企 | 窗台、沙發、貓 | — |
| 出街 | 港鐵站、小巴、街市 | 出門記得帶鎖匙。 |
| 學校 | 校門、課室 | 鐘響之前，買個麵包都得。 |
| 過節 | 燈籠、月餅 | 功課放下，燈籠點起。 |

未行到：該區灰階、蒙霧，句字係「仲未行到呢度。慢慢嚟。」
行緊：該區有色，週燈同街燈跟進度亮。
行完：地標亮起（窗台、港鐵站牌、校門牌、燈籠）。

週燈同街燈用唔同形狀。週燈係圓腳印，街燈係菱形。唔好淨靠顏色分。

## 主題節點改用生字卡圖

舊地圖蛇路上面嘅 emoji 唔再做主題圖示。每個主題揀該主題其中一張生字卡圖做節點。

第 1 季建議（每主題一張，可以換）：

| 主題 | 生字圖 |
| --- | --- |
| 自我介紹同家人 | `assets/icons/family.png` |
| 身體 | `assets/icons/head.png` |
| 屋企同家具 | `assets/icons/home.png` |
| 日常作息 | `assets/icons/wake.png` |
| 食物 | `assets/icons/noodles.png` |
| 飲品同茶餐廳 | `assets/icons/water.png` |
| 衣服 | `assets/icons/clothes.png` |
| 顏色、形狀、數字 | `assets/icons/red.png` |
| 天氣 | `assets/icons/weather.png` |
| 時間同日期 | `assets/icons/time.png` |
| 動物同寵物 | `assets/icons/animal.png` |
| 情緒 | `assets/icons/happy.png` |

第 2 至第 4 季未有獨立生字圖之前，節點留空位，唔好再填 emoji。有圖之後用同一規則。

## 未解鎖要灰，食物都一樣

未解鎖嘅主題，張生字圖本身灰階、變淡。解鎖之後先恢復顏色。

而家 app 嘅蛇路有個洞：灰階只打中 emoji。食物主題用咗 `noodles.png` 一張圖，未解鎖都仲係彩色。下一輪唔好再分開兩種圖示。食物同其他主題一樣，未解鎖就灰。

## 未做

app 嘅 `js/`、`css/`、`index.html` 呢輪冇改。
