export function utils() { }
utils.multiplyMatrix = function (a, b) {
  // Matrix multiply a * b
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5]
  ];
}

utils.multiplyCoordinate = function (a, b) {
  return [a[0] * b[0] + a[2] * b[1] + a[4],
  a[1] * b[0] + a[3] * b[1] + a[5]]
}

utils.degreesToRadians = function (degrees) {
  return degrees * Math.PI / 180;
}

utils.radiansToDegrees = function (radians) {
  return radians / Math.PI * 180;
}

export function addRotate(deltaAngle: number, currentAngle: number, hasMirror: boolean, currentMatrix: number[]) {
  if (!deltaAngle) {
    return;
  }

  //如果已翻转，再旋转
  if (this.hasMirror) {
    deltaAngle = -deltaAngle;
  }

  currentAngle += deltaAngle;
  return addRotateMatrix(currentMatrix, deltaAngle);
}

export function addRotateMatrix(currentMatrix: number[], deltaAngle: number) {
  var radian = utils.degreesToRadians(deltaAngle),
    cos = Math.cos(radian),
    sin = Math.sin(radian);
  var rotateMatrix = [cos, sin, -sin, cos, 0, 0];
  return addMatrix(currentMatrix, rotateMatrix);
}

export function addTranslate(currentMatrix: number[], translateX, translateY) {
  var translateMatrix = [1, 0, 0, 1, translateX, translateY];
  return addMatrix(currentMatrix, translateMatrix);
}

export function addMatrix(currentMatrix: number[], matrix: number[]) {
  return utils.multiplyMatrix(currentMatrix, matrix);
}
export class StandardOperation {
  originalMatrix = [1, 0, 0, 1, 0, 0];
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  flipX: boolean;
  flipY: boolean;
  angle: number;

  originalX: number;
  originalY: number;
  currentMatrix: number[];
  currentAngle: number;
  hasMirror: boolean

  skewX: number;
  skewY: number;
  constructor() {
    this.translateX = 0;
    this.translateY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.flipX = false;
    this.flipY = false;
    this.angle = 0;

    this.originalX = 0;
    this.originalY = 0;
    this.currentMatrix = [1, 0, 0, 1, 0, 0];
    this.currentAngle = 0;
    this.hasMirror = false;
  }


  toMatrix() {
    return this.currentMatrix;
  }

  toOperation(matrix) {
    let a = matrix;
    var radian = Math.atan2(a[1], a[0]),
      denom = Math.pow(a[0], 2) + Math.pow(a[1], 2),
      scaleX = Math.sqrt(denom),
      scaleY = (a[0] * a[3] - a[2] * a[1]) / scaleX,
      skewX = Math.atan2(a[0] * a[2] + a[1] * a[3], denom);
    var op = this;
    op.angle = radian / Math.PI * 180;
    op.scaleX = scaleX;
    op.scaleY = scaleY;
    op.skewX = skewX / Math.PI * 180;
    op.skewY = 0;
    op.translateX = a[4];
    op.translateY = a[5];
  }

  addMatrix(matrix) {
    var curMatrix = this.currentMatrix;
    this.currentMatrix = utils.multiplyMatrix(curMatrix, matrix);
    this.toOperation(this.currentMatrix);
  }

  addTranslate(translateX, translateY) {
    var translateMatrix = [1, 0, 0, 1, translateX, translateY];
    this.addMatrix(translateMatrix);
  }

  addRotate(deltaAngle) {
    if (!deltaAngle) {
      return;
    }

    //如果已翻转，再旋转
    if (this.hasMirror) {
      deltaAngle = -deltaAngle;
    }

    this.currentAngle += deltaAngle;
    this.addRotateMatrix(deltaAngle);
  }


  addRotateMatrix(deltaAngle) {
    var radian = utils.degreesToRadians(deltaAngle),
      cos = Math.cos(radian),
      sin = Math.sin(radian);
    var rotateMatrix = [cos, sin, -sin, cos, 0, 0];
    this.addMatrix(rotateMatrix);
  }

  addFlip(flipAxis) {
    if (!flipAxis) {
      return;
    }

    if (flipAxis == "x") {
      this.flipX = !this.flipX;
      this.hasMirror = !this.hasMirror;
      this.currentMatrix[1] = -1 * this.currentMatrix[1];
      this.currentMatrix[3] = -1 * this.currentMatrix[3];
    }
    else if (flipAxis == "y") {
      this.flipY = !this.flipY;
      this.hasMirror = !this.hasMirror;
      this.currentMatrix[0] = -1 * this.currentMatrix[0];
      this.currentMatrix[2] = -1 * this.currentMatrix[2];
    }

    return;
    //if has rotate，revert rotate by rotate current angle
    var currentAngle = this.angle;
    if (currentAngle) {
      var deltaAngle = -currentAngle;
      var radian = utils.degreesToRadians(deltaAngle),
        cos = Math.cos(radian),
        sin = Math.sin(radian);
      var rotateMatrix = [cos, sin, -sin, cos, 0, 0];
      this.addMatrix(rotateMatrix);
    }
    //then flip on current axis
    flipAxis = flipAxis.toLowerCase();
    var scaleMatrix = [
      flipAxis == "x" ? -1 : 1,
      0,
      0,
      flipAxis == "y" ? -1 : 1,
      0,
      0
    ];
    this.addMatrix(scaleMatrix);

    if (currentAngle) {
      var deltaAngle = currentAngle;
      var radian = utils.degreesToRadians(deltaAngle),
        cos = Math.cos(radian),
        sin = Math.sin(radian);
      var rotateMatrix = [cos, sin, -sin, cos, 0, 0];
      this.addMatrix(rotateMatrix);
    }
  }

  addScale(scaleX, scaleY) {

  }

  calcRotateMatrix(opr) {
    if (!opr.angle) {
      return this.originalMatrix;
    }
    var radiian = utils.degreesToRadians(opr.angle),
      cos = Math.cos(radiian),
      sin = Math.sin(radiian);
    return [cos, sin, -sin, cos, 0, 0];
  }

  calcDimensionsMatrix(opr) {
    var scaleX = typeof opr.scaleX === 'undefined' ? 1 : opr.scaleX,
      scaleY = typeof opr.scaleY === 'undefined' ? 1 : opr.scaleY,
      scaleMatrix = [
        opr.flipX ? -scaleX : scaleX,
        0,
        0,
        opr.flipY ? -scaleY : scaleY,
        0,
        0
      ];
    if (opr.skewX) {
      scaleMatrix = utils.multiplyMatrix(
        scaleMatrix, [1, 0, Math.tan(utils.degreesToRadians(opr.skewX)), 1]);
    }
    if (opr.skewY) {
      scaleMatrix = utils.multiplyMatrix(
        scaleMatrix, [1, Math.tan(utils.degreesToRadians(opr.skewY)), 0, 1]);
    }
    return scaleMatrix;
  }
}
