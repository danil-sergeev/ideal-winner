
let encoder = str => {
	let bytes = [];
	let num;
	str.split('').map(symb => {
		if (RegExp('[A-Z]').test(symb)) {
			bytes.push(14); // UPPER
			symb = symb.toLowerCase()
		}

		switch (true) {
			case (symb === ' '): bytes.push(0); break;
			case (symb === 'e'): bytes.push(1); break;
			case (symb === 't'): bytes.push(2); break;
			case (symb === 'a'): bytes.push(3); break;
			case (symb === 'o'): bytes.push(4); break;
			case (symb === 'i'): bytes.push(5); break;
			case (symb === 'n'): bytes.push(6); break;
			case (symb === 'h'): bytes.push(7); break;
			case (symb === 's'): bytes.push(8); break;
			case (symb === 'r'): bytes.push(9); break;
			case (symb === 'd'): bytes.push(10); break;
			case (symb === 'l'): bytes.push(11); break;
			case (symb === 'u'): bytes.push(12); break;
			case (symb === 'm'): bytes.push(13); break;

			case (symb === 'c'): bytes.push(15, 0); break;
			case (symb === 'y'): bytes.push(15, 1); break;
			case (symb === 'w'): bytes.push(15, 2); break;
			case (symb === 'f'): bytes.push(15, 3); break;
			case (symb === 'g'): bytes.push(15, 4); break;
			case (symb === 'b'): bytes.push(15, 5); break;
			case (symb === ','): bytes.push(15, 6); break;
			case (symb === 'p'): bytes.push(15, 7); break;
			case (symb === '.'): bytes.push(15, 8); break;
			case (symb === 'v'): bytes.push(15, 9); break;
			case (symb === 'k'): bytes.push(15, 10); break;
			case (symb === '"'): bytes.push(15, 11); break;
			case (symb === ';'): bytes.push(15, 12); break;

			case (symb === 'j'): bytes.push(15, 13, 0); break;
			case (symb === 'z'): bytes.push(15, 13, 1); break;
			case (symb === '_'): bytes.push(15, 13, 2); break;
			case (symb === 'x'): bytes.push(15, 13, 3); break;
			case (symb === 'q'): bytes.push(15, 13, 4); break;
			case (symb === '!'): bytes.push(15, 13, 5); break;
			case (symb === '?'): bytes.push(15, 13, 6); break;
			case (symb === '-'): bytes.push(15, 13, 7); break;
			case (symb === ':'): bytes.push(15, 13, 8); break;
			case (symb === '1'): bytes.push(15, 13, 9); break;
			case (symb === '2'): bytes.push(15, 13, 10); break;
			case (symb === '3'): bytes.push(15, 13, 11); break;
			case (symb === '4'): bytes.push(15, 13, 12); break;

			// case (symb === ''): bytes.push(15, 13, 13); break; STRING SEPARATOR
			// case (symb === ''): bytes.push(15, 13, 14); break; LINE SEPARATOR

			case (symb === '5'): bytes.push(15, 14, 0); break;
			case (symb === '('): bytes.push(15, 14, 1); break;
			case (symb === ')'): bytes.push(15, 14, 2); break;
			case (symb === '0'): bytes.push(15, 14, 3); break;
			case (symb === '*'): bytes.push(15, 14, 4); break;
			case (symb === '6'): bytes.push(15, 14, 5); break;
			case (symb === '/'): bytes.push(15, 14, 6); break;
			case (symb === '8'): bytes.push(15, 14, 7); break;
			case (symb === '9'): bytes.push(15, 14, 8); break;
			case (symb === '7'): bytes.push(15, 14, 9); break;
			case (symb === '['): bytes.push(15, 14, 10); break;
			case (symb === '#'): bytes.push(15, 14, 11); break;
			case (symb === ']'): bytes.push(15, 14, 12); break;
			case (symb === "'"): bytes.push(15, 14, 13); break;
			case (symb === '@'): bytes.push(15, 14, 14); break;
			case (symb === '$'): bytes.push(15, 14, 15); break;

			case (symb === '%'): bytes.push(15, 15, 0); break;
			case (symb === '+'): bytes.push(15, 15, 1); break;
			case (symb === '<'): bytes.push(15, 15, 2); break;
			case (symb === '>'): bytes.push(15, 15, 3); break;
			case (symb === '='): bytes.push(15, 15, 4); break;
			case (symb === '^'): bytes.push(15, 15, 5); break;
			case (symb === '`'): bytes.push(15, 15, 6); break;
			case (symb === '{'): bytes.push(15, 15, 7); break;
			case (symb === '}'): bytes.push(15, 15, 8); break;
			case (symb === '~'): bytes.push(15, 15, 9); break;
			case (symb === '|'): bytes.push(15, 15, 10); break;
		}
	})
	// console.log('BYTES', bytes)
	return bytes;
}


let encodeArr = arrOfArrOfStr => {
	let output = [];


	arrOfArrOfStr.map(arrOfStr => {
		let qArr = []

		arrOfStr.map(str => {
			qArr = qArr.concat(encoder(str))
			qArr.push(15, 13, 13)

		})

		output = output.concat(qArr)
		output.push(15, 13, 14)

	})

	return output
}


let encodePack = bytes => {
	// console.log('bytes:', bytes)
	let last = ''
	// arr = []
	let str = ''
	if (bytes.length % 2 == 1) bytes.push(14)

	bytes.map(b => {
		str += Number(b).toString(16)
		// if (last.length == 0) {
		//   last = Number(b).toString(16)
		// } else {
		//   last += Number(b).toString(16)
		//   arr.push(last)
		//   last = ''
		// }
	})
	// let b2 = '';
	// bytes.map(b => b2 += Number(b).toString(2).padStart(5, '0'))

	// while (b2.length % 8 != 0) {
	//   b2 += Number(26).toString(2) // UPPERCASES IN THE END
	// }
	// console.log('B2::', b2)

	// let arr = [];
	// while (b2) {
	//   arr.push(parseInt(parseInt(b2.slice(-8), 2).toString(16),16))
	//   b2 = b2.slice(0, -8)
	// }

	// let b = Buffer.from(arr);

	// console.log('b:', b)
	// console.log('b16hex:', arr)
	// console.log('b2:', b2)
	// console.log('arr:', arr)

	// return b;
	// console.log('buff:', Buffer.from(str, 'hex'))
	// console.log('arr:', arr)
	return Buffer.from(str, 'hex')
};


let decoder = buff => {
	let b16;
	console.log('typeof buff', typeof buff)
	if (typeof buff == 'string') b16 = buff.slice(6)
	if (typeof buff == 'buffer') b16 = buff.toString('hex')
	console.log('b16', b16)
	let arr = []
	while (b16.length) {
		let num = parseInt(b16.slice(-1), 16)
		// arr.push(b16.slice(-2))
		b16 = b16.slice(0, -1)
		arr.push(num)
	}

	arr = arr.reverse();

	let state = {
		mode: 0,
		upper: false,
		result: '',
		arrGlobal: [],
		arrLocal: [],
		strCurrent: ''
	}

	let addSymbol = (state, b) => {
		let state_old = JSON.parse(JSON.stringify(state));
		if (state.upper) b = b.toUpperCase();
		state.upper = false;
		state.strCurrent += b;
		state.mode = 0;
		// console.log('STATE OLD:', state_old, 'STATE:', state, 'b:', b )
	}

	arr.map(b => {
		switch (true) {
			case (state.mode === 0 && b == 0):     addSymbol(state, ' '); break;
			case (state.mode === 0 && b == 1):     addSymbol(state, 'e'); break;
			case (state.mode === 0 && b == 2):     addSymbol(state, 't'); break;
			case (state.mode === 0 && b == 3):     addSymbol(state, 'a'); break;
			case (state.mode === 0 && b == 4):     addSymbol(state, 'o'); break;
			case (state.mode === 0 && b == 5):     addSymbol(state, 'i'); break;
			case (state.mode === 0 && b == 6):     addSymbol(state, 'n'); break;
			case (state.mode === 0 && b == 7):     addSymbol(state, 'h'); break;
			case (state.mode === 0 && b == 8):     addSymbol(state, 's'); break;
			case (state.mode === 0 && b == 9):     addSymbol(state, 'r'); break;
			case (state.mode === 0 && b == 10):    addSymbol(state, 'd'); break;
			case (state.mode === 0 && b == 11):    addSymbol(state, 'l'); break;
			case (state.mode === 0 && b == 12):    addSymbol(state, 'u'); break;
			case (state.mode === 0 && b == 13):    addSymbol(state, 'm'); break;
			case (state.mode === 0 && b == 14):    state.upper = true; break;
			case (state.mode === 0 && b == 15):    state.mode = 1; break;

			case (state.mode === 1 && b === 0):     addSymbol(state, 'c'); break;
			case (state.mode === 1 && b === 1):     addSymbol(state, 'y'); break;
			case (state.mode === 1 && b === 2):     addSymbol(state, 'w'); break;
			case (state.mode === 1 && b === 3):     addSymbol(state, 'f'); break;
			case (state.mode === 1 && b === 4):     addSymbol(state, 'g'); break;
			case (state.mode === 1 && b === 5):     addSymbol(state, 'b'); break;
			case (state.mode === 1 && b === 6):     addSymbol(state, ','); break;
			case (state.mode === 1 && b === 7):     addSymbol(state, 'p'); break;
			case (state.mode === 1 && b === 8):     addSymbol(state, '.'); break;
			case (state.mode === 1 && b === 9):     addSymbol(state, 'v'); break;
			case (state.mode === 1 && b === 10):    addSymbol(state, 'k'); break;
			case (state.mode === 1 && b === 11):    addSymbol(state, '"'); break;
			case (state.mode === 1 && b === 12):    addSymbol(state, ';'); break;
			case (state.mode === 1 && b === 13):    state.mode = 2; break;
			case (state.mode === 1 && b === 14):    state.mode = 3; break;
			case (state.mode === 1 && b === 15):    state.mode = 4; break;



			case (state.mode === 2 && b === 0):     addSymbol(state, 'j'); break;
			case (state.mode === 2 && b === 1):     addSymbol(state, 'z'); break;
			case (state.mode === 2 && b === 2):     addSymbol(state, '_'); break;
			case (state.mode === 2 && b === 3):     addSymbol(state, 'x'); break;
			case (state.mode === 2 && b === 4):     addSymbol(state, 'q'); break;
			case (state.mode === 2 && b === 5):     addSymbol(state, '!'); break;
			case (state.mode === 2 && b === 6):     addSymbol(state, '?'); break;
			case (state.mode === 2 && b === 7):     addSymbol(state, '-'); break;
			case (state.mode === 2 && b === 8):     addSymbol(state, ':'); break;
			case (state.mode === 2 && b === 9):     addSymbol(state, '1'); break;
			case (state.mode === 2 && b === 10):    addSymbol(state, '2'); break;
			case (state.mode === 2 && b === 11):    addSymbol(state, '3'); break;
			case (state.mode === 2 && b === 12):    addSymbol(state, '4'); break;
			case (state.mode == 2 && b == 13):    state.upper = false; state.mode = 0; state.arrLocal.push(state.strCurrent); state.strCurrent = ''; break;
			case (state.mode == 2 && b == 14):    state.upper = false; state.mode = 0; state.arrGlobal.push(state.arrLocal); state.arrLocal = []; state.strCurrent = ''; break;
			case (state.mode === 3 && b === 0):     addSymbol(state, '5'); break;
			case (state.mode === 3 && b === 1):     addSymbol(state, '('); break;
			case (state.mode === 3 && b === 2):     addSymbol(state, ')'); break;
			case (state.mode === 3 && b === 3):     addSymbol(state, '0'); break;
			case (state.mode === 3 && b === 4):     addSymbol(state, '*'); break;
			case (state.mode === 3 && b === 5):     addSymbol(state, '6'); break;
			case (state.mode === 3 && b === 6):     addSymbol(state, '/'); break;
			case (state.mode === 3 && b === 7):     addSymbol(state, '8'); break;
			case (state.mode === 3 && b === 8):     addSymbol(state, '9'); break;
			case (state.mode === 3 && b === 9):     addSymbol(state, '7'); break;
			case (state.mode === 3 && b === 10):    addSymbol(state, '['); break;
			case (state.mode === 3 && b === 11):    addSymbol(state, '#'); break;
			case (state.mode === 3 && b === 12):    addSymbol(state, ']'); break;
			case (state.mode === 3 && b === 13):    addSymbol(state, "'"); break;
			case (state.mode === 3 && b === 14):    addSymbol(state, '@'); break;
			case (state.mode === 3 && b === 15):    addSymbol(state, '$'); break;
			case (state.mode == 4 && b == 0):     addSymbol(state, '%'); break;
			case (state.mode == 4 && b == 1):     addSymbol(state, '+'); break;
			case (state.mode == 4 && b == 2):     addSymbol(state, '<'); break;
			case (state.mode == 4 && b == 3):     addSymbol(state, '>'); break;
			case (state.mode == 4 && b == 4):     addSymbol(state, '='); break;
			case (state.mode == 4 && b == 5):     addSymbol(state, '^'); break;
			case (state.mode == 4 && b == 6):     addSymbol(state, '`'); break;
			case (state.mode == 4 && b == 7):     addSymbol(state, '{'); break;
			case (state.mode == 4 && b == 8):     addSymbol(state, '}'); break;
			case (state.mode == 4 && b == 9):     addSymbol(state, '~'); break;
			case (state.mode == 4 && b == 10):    addSymbol(state, '|'); break;
		}
	})

	return state.arrGlobal;
}


module.exports = {
	encoder: encoder,
	decoder: decoder,
	encodePack: encodePack,
	encodeArr: encodeArr
}

