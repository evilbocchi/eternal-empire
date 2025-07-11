import Item from "shared/item/Item";
import Price from "shared/Price";

declare global {
    interface ItemTypes {
        Operative: Operative;
    }
}

class Operative extends Item {
    add: Price | undefined;
    mul: Price | undefined;
    pow: Price | undefined;

    constructor(id: string) {
        super(id);
        this.types.add("Operative");
    }

    setAdd(add: Price | undefined) {
        this.add = add;
        return this;
    }

    setMul(mul: Price | undefined) {
        this.mul = mul;
        return this;
    }

    setPow(pow: Price | undefined) {
        this.pow = pow;
        return this;
    }
}

export = Operative;