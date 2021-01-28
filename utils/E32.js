
let data = [
  ['This is a Question 1', 'answer11', 'answer12', 'answer13', 'answer14'],
  ['This is a Question 2', 'answer21', 'answer22', 'answer23', 'answer24'],
  ['This is a Question 3', 'answer31', 'answer32', 'answer33', 'answer34'],
  ['This is a Question 4', 'answer41', 'answer42', 'answer43', 'answer44'],
  ['This is a Question 5', 'answer51', 'answer52', 'answer53', 'answer54'],
]

let encodeArr = arrOfArrOfStr => {
  let output = [];


  arrOfArrOfStr.map(arrOfStr => {
    let qArr = []

    arrOfStr.map(str => {
      qArr = qArr.concat(encoder(str))
      qArr.push(27)

    })

    output = output.concat(qArr)
    output.push(28)

  })

  return output
}

let encoder = str => {
  let bytes = [];
  let num;
  str.split('').map(symb => {
    switch (true) {
      case (symb == ' '):
        bytes.push(31);
        break;

      case RegExp('[a-z]').test(symb):
        num = symb.toLowerCase().charCodeAt(0) - 97;
        bytes.push(num);
        break;

      case RegExp('[A-Z]').test(symb):
        num = symb.toLowerCase().charCodeAt(0) - 97;
        bytes.push(26);
        bytes.push(num);
        break;

      case (symb.toLowerCase().charCodeAt(0) >= 33) && (symb.toLowerCase().charCodeAt(0) <= 64):
        num = symb.toLowerCase().charCodeAt(0) - 33;
        bytes.push(29);
        bytes.push(num);
        break;

      case (symb.toLowerCase().charCodeAt(0) >= 91) && (symb.toLowerCase().charCodeAt(0) <= 96):
        num = symb.toLowerCase().charCodeAt(0) - 91;
        bytes.push(30);
        bytes.push(num);
        break;

      case (symb.toLowerCase().charCodeAt(0) >= 123) && (symb.toLowerCase().charCodeAt(0) <= 126):
        num = symb.toLowerCase().charCodeAt(0) - 123 + 6;
        bytes.push(30);
        bytes.push(num);
        break;
    }
  })

  return bytes;
};

let encodePack = bytes => {
  // console.log('bytes:', bytes)

  // console.log('bytes b2:', bytes.map(b => Number(b).toString(2).padStart(5, '0')))
  let b2 = '';
  bytes.map(b => b2 += Number(b).toString(2).padStart(5, '0'))

  while (b2.length % 8 != 0) {
    b2 += Number(26).toString(2) // UPPERCASES IN THE END
  }
  // console.log('B2::', b2)

  let arr = [];
  while (b2) {
    arr.push(parseInt(parseInt(b2.slice(-8), 2).toString(16),16))
    b2 = b2.slice(0, -8)
  }

  let b = Buffer.from(arr);

  // console.log('b:', b)
  // console.log('b16hex:', arr)
  // console.log('b2:', b2)
  // // console.log('arr:', arr)

  return b;
};


let decoder = buff => {

  // b16.map(el => parseInt(el, 16))
  if (!buff) return
  let b16 = buff.toString('hex')
  // console.log('decoder b16:', b16)
  // // console.log('b16hex:', b16)
  // let b2 = parseInt(b16, 16).toString(2)
  // // console.log('b2:', b2)

  let b2 = '';
  while (b16) {
    b2 += parseInt(b16.slice(-2), 16).toString(2).padStart(8, '0')
    // arr.push(b16.slice(-2))
    b16 = b16.slice(0, -2)
  }

  // console.log('b2:', b2)

  let arr = [];
  while (b2) {
    arr.push(b2.slice(0,5))
    // arr.push(b16.slice(-2))
    b2 = b2.slice(5)
  }

  arr = arr.map(el => parseInt(el, 2))
  // console.log('arr:', arr)


  let result = '';

  let state = {
    mode: 0,
    upper: false,
    arrGlobal: [],
    arrLocal: [],
    strCurrent: ''
  };



  arr.map(el => {
    switch (true) {
      case ((state.mode == 0) && (el <= 25)):
        if (state.upper) result += String.fromCharCode(el + 65);
        if (!state.upper) result += String.fromCharCode(el + 97);
        state.upper = false;
        state.strCurrent += result[result.length - 1];
        break;

      case (state.mode == 1):
        result += String.fromCharCode(el + 33);
        state.mode = 0;
        state.strCurrent += result[result.length - 1];
        break;

      case (state.mode == 2):
        if (el <= 5) result += String.fromCharCode(el + 91)
        if ((el >= 6) && (el <= 9)) result += String.fromCharCode(el + 123 - 6);
        state.mode = 0;
        state.strCurrent += result[result.length - 1];
        break;

      case ((state.mode == 0) && (el == 26)):
        state.upper = true;
        break;

      case ((state.mode == 0) && (el == 27)):
        // // console.log('state.strCurrent:', state.strCurrent, 'state.arrLocal:', state.arrLocal)
        state.arrLocal.push(state.strCurrent);
        state.strCurrent = '';
        break;

      case ((state.mode == 0) && (el == 28)):
        state.arrGlobal.push(state.arrLocal);
        state.arrLocal = [];
        state.strCurrent =  '';
        break;

      case ((state.mode == 0) && (el == 29)):
        // console.log('State mode 1 ON')
        state.mode = 1;
        break;

      case ((state.mode == 0) && (el == 30)):
        // console.log('State mode 2 ON')
        state.mode = 2;
        break;

      case ((state.mode == 0) && (el == 31)):
        result += ' ';
        state.strCurrent += result[result.length - 1];
        break;
    };
  });

  return state.arrGlobal;
};


module.exports = {
  encodeArr: encodeArr,
  encoder: encoder,
  encodePack: encodePack,
  decoder: decoder
}

