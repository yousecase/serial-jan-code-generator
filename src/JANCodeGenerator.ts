export default class JANCodeGenerator {
    // JANCodeからチェックディジットを除いた部分は最大12桁
    private static readonly MAX_MAIN_CODE_PART: number = 999_999_999_999;

    // 配列の最大値は仕様上2^32-1(約43億)
    // ブラウザにより最大値が異なり多くて6万程度
    // 暫定値として100万とする
    private static readonly MAX_QUANTITY: number = 1_000_000;

    // startJANCodeの次のJANコードからquantity個のJANコードを生成する
    public static getSerialJANCodeList(startJANCode: number, quantity: number): number[] {
        if (isNaN(startJANCode) || isNaN(quantity) ||
            startJANCode < 0 || quantity < 0 || this.MAX_QUANTITY < quantity) {
            return [];
        }

        // 小数点以下を削除
        startJANCode = Math.floor(startJANCode);
        quantity = Math.floor(quantity);

        // チェックディジット以外の部分を取得する
        const mainCodePart: number = this.removeFirstDigit(startJANCode);

        // 引数で指定されたstartJANCodeの次のJANから生成する
        const firstMainCodePart: number = mainCodePart + 1;

        const lastMainCodePart: number =
            Math.min(mainCodePart + quantity, this.MAX_MAIN_CODE_PART);

        const mainCodePartList: number[] =
            this.getSerialNumberList(firstMainCodePart, lastMainCodePart);

        const JANCodeList: number[] =
            mainCodePartList.map(value => this.addCheckDigit(value));
        return JANCodeList;
    }

    private static getFirstDigit(num: number): number {
        return num % 10;
    }

    private static removeFirstDigit(num: number): number {
        return Math.floor(num / 10);
    }

    private static calculateCheckDigit(mainCodePart: number): number {
        let evenDigitSum: number = 0;
        let oddDigitSum: number = 0;

        // 偶数桁と奇数桁に分けて下の桁から加算していく
        while (0 < mainCodePart) {
            // 偶数桁を加算(チェックディジット削除済みのため1桁目が偶数桁になる)
            evenDigitSum += this.getFirstDigit(mainCodePart);
            mainCodePart = this.removeFirstDigit(mainCodePart);

            // 奇数桁を加算
            oddDigitSum += this.getFirstDigit(mainCodePart);
            mainCodePart = this.removeFirstDigit(mainCodePart);
        }

        const sum: number = evenDigitSum * 3 + oddDigitSum;
        const checkDigit: number = 10 - sum % 10;

        if (checkDigit === 10) {
            return 0;
        }
        return checkDigit;
    }

    private static addCheckDigit(mainCodePart: number): number {
        return mainCodePart * 10 + this.calculateCheckDigit(mainCodePart);
    }

    private static getSerialNumberList(first: number, last: number): number[] {
        let list: number[] = [];
        while (first <= last) {
            list.push(first);
            first++;
        }
        return list;
    }

    // JANCodeの最低桁数の2と8桁の差の6桁分の0を先頭に追加する
    private static readonly PREFIX: string = '0'.repeat(6);

    public static format(JANCode: number): string {
        const JANCodeString: string = JANCode.toFixed();

        if (JANCodeString.length <= 8) {// 8桁以下
            return (this.PREFIX + JANCodeString).substr(-8);
        } else {// 9桁-13桁
            return (this.PREFIX + JANCodeString).substr(-13);
        }
    }
}