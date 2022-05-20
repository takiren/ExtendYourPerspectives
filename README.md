# お手軽パースツール in Photoshop

Photoshopでパースの計算を任せるためのプラグインです。

一部クラッシュ対策を行っていないため非公開にしています。 

## 要求環境
* Adobe Photoshop 23.3 or higher.

    旧バージョンだとAPIが古いため動作しない。
* Adobe UXP Developer Tool

## 警告
開発途中・また技術的制約のため動作が不安定なおそれがあります。

壊れてもいいファイルでご使用ください。

## 使い方 Usage
1. ダウンロード&解凍
2. **Adobe UXP Developer Tool**で**manifest.json**を読み込む
3. loadする。
4. パネルがメインディスプレイの左上に表示されるので適当な位置に移動＆サイズ変更して使う。
5. パネルが表示されない場合はPhotoshopメニュー -> ウィンドウ -> プラグインでプラグインパネルを表示してください。

## 設計・コードについて
-------------------
## クラス図
![クラス図](out\graph\Architecture.png "クラス図")

使用しているコードはすべて./src/*にあります。

基本的にクラスごとでファイル分けしています。

CameraクラスはCamera.js、WorldクラスはWorld.jsに記述されてます。
## 各クラス解説
### Worldクラス
このクラスにカメラやPolyなど登録する。

### Cameraクラス
頂点の座標変換を行う。

### 描画フロー


### 命名規則
クラスに命名規則は設けているがそれ以外はあまり考えていないため見づらくなっています。
>#### 変数
* 型を最初につける。頭文字は必ず小文字

>#### 関数
* 基本的に最初は小文字。
* 値を返す場合はgetをつける。
* 代入する場合はsetをつける。
* なにかの計算が発生する場合(行列の計算など)はその計算を表す動詞をつける。
    ##### 例
    * Matrix.multiply() 行列の掛け算を行うためmultiplyをつける。
    * Matrix.translate()
