# お手軽パースツール in Photoshop

Photoshopでパースの計算を任せるためのプラグインです。
一部クラッシュ対策を行っていないため非公開にしています。 


## 命名規則
### 変数
* 型を最初につける。頭文字は必ず小文字

### 関数
* 値を返す場合はgetをつける。
* 代入する場合はsetをつける。
* なにかの計算が発生する場合(行列の計算など)はその計算を表す動詞をつける。
#### 例
Matrix.multiply 行列の掛け算を行うためmultiplyをつける。
