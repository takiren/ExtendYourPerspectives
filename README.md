# お手軽パースツール in Photoshop

Photoshopでパースの計算を任せるためのプラグインです。

一部クラッシュ対策を行っていないため非公開にしています。 

## 要求環境
* Adobe Photoshop 23.3 or higher.

    旧バージョンだとAPIが古いため動作しない。
* Adobe UXP Developer Tool

## 諸注意
>開発途中・また技術的制約のため動作が不安定なおそれがあります。

>壊れてもいいドキュメントでご使用ください。

>プラグインの日本語名はお手軽パースツール(仮)ですが開発では**ExtendYourPerspectivs**にしています。

>技術的理由によりインプットボックスが数値以外も入力できるようになっています。
これはAdobe UXP APIのバグによるものです。

## インストール
1. ダウンロード&解凍
2. **Adobe UXP Developer Tool**で**manifest.json**を読み込む
3. ExtendYourPerspectivesをload。
4. パネルがメインディスプレイの左上に表示されるので適当な位置に移動＆サイズ変更して使う。
5. パネルが表示されない場合はPhotoshopメニュー -> ウィンドウ -> プラグインでプラグインパネルを表示してください。

## 使い方
### パースライン描画(グリッド描画)
<img src="documentation\graph\homepanel.png" width="50%">

1. 視点と注視点、画角を設定する。
2. **パースライン設定**から引く本数を指定する。
3. パース描画をクリック。

### パスの変形
パスを平面図としてとらえ変形する。
言葉でも説明できるが伝わらないため実際に試していただきたい。
<img src="documentation\graph\transformation1.png" width ="90%">
<img src="documentation\graph\path list.png" width =90%>

カメラのパラメータを決めるパス"カメラパス"と平面図となるパス"平面図パス"の2つを用意する。
<img src="documentation\graph\homepanel.png" width="50%">

ホームタブのカメラパスグループのパスの一覧更新を押すとカメラパスに使えるパスの一覧がドロップダウンメニューに追加される

カメラパスにしたいパスを選択した状態でカメラ座標逆算ボタンを押すと
カメラパスからカメラの位置が計算され、カメラ設定の値が変化する。

# 設計・コードについて
## クラス図
![クラス図](out\graph\Architecture.png "クラス図")

使用しているコードはすべて./src/*にあります。

基本的にクラスごとでファイル分けしています。

CameraクラスはCamera.js、WorldクラスはWorld.jsに記述されてます。
## 各クラス解説
### Worldクラス
このクラスにカメラやPolyなど登録する。
**右手座標系。**

### Cameraクラス
頂点の座標変換(World -> Screen)を行う。
カメラは**左手座標系**

## 処理解説

### 全体のフロー
1. **index.js** の**Init()** で初期化。PhotoshopAPI、ドキュメント、定数をロード
2. **Camera**インスタンスを生成
3. **World**のコンストラクタに**Camera**インスタンスを渡す
4. **Point**インスタンスを生成
5. **Poly**インスタンスを生成
6. **Poly**インスタンスにPointインスタンスを追加
7. **World**に**Poly**インスタンスを追加
8. 描画処理(下記参照)

## 描画処理

### フロー
![描画フロー](out\graph\drawSequence.png "描画フロー")

1. DrawerからWorldにDrawObjectをリクエスト
2. WorldはPolyの頂点座標をCameraに渡し、スクリーン座標変換をリクエスト
3. Cameraはスクリーン座標変換を行い値を返す
4. 戻り値からDrawObjectElementsをPoly.length個生成
5. DrawObjectにDrawObjectElementsを追加
6. Drawerがスクリーン座標にパスを生成するようPhotoshopAPIにリクエスト
7. Drawerがスクリーン座標にパスのストロークを描画するようリクエスト
8. DrawerがPhotoshopAPIに作成したパス消去するようリクエスト

## 命名規則

クラスには命名規則を設けているがそれ以外はまだ設計が固まっていないため規則がありません。

特に**index.js**
>### 変数
* 型を最初につける。先頭は必ず小文字。
* インスタンスは接頭辞大文字の**I**を使う。
* boolの場合は接頭辞bを使う。

>### 関数
基本的に以下に習う。ぱっと見でわかるような名前にする
* 基本的に最初は小文字。
* 値を返す場合はgetをつける。
* 代入する場合はsetをつける。
* boolを返す場合はIs***()の形式で書く。
    #### 例
    * Poly.IsClosed() Polyが閉じているか開いているかを返す。
    * DrawObjectElements.IsClosed() DrawObjectElementsが閉じているか開いているかを返す。
* なにかの計算(操作)が発生する場合(行列の計算など)はその計算(操作)を表す動詞をつける。
    #### 例
    * Matrix.multiply() 行列の掛け算(translate)を行うためmultiplyをつける。
    * Matrix.translate() 行列の平行移動(translate)を行うためtranslate
* インスタンスの変数を直接書き換える場合は接尾時にOverrideを使う。