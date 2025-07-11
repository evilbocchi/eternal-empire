declare interface Number {
	/** macro for Number + Number */
	add<T extends Number>(this: T, Number: Number): T;
	/** macro for Number + Value */
	add<T extends Number>(this: T, val: Value): T;

	/** macro for Number - Number */
	sub<T extends Number>(this: T, Number: Number): T;
	/** macro for Number - Value */
	sub<T extends Number>(this: T, val: Value): T;

	/** macro for Number * Number */
	mul<T extends Number>(this: T, Number: Number): T;
	/** macro for Number * Value */
	mul<T extends Number>(this: T, val: Value): T;

	/** macro for Number / Number */
	div<T extends Number>(this: T, Number: Number): T;
	/** macro for Number / Value */
	div<T extends Number>(this: T, val: Value): T;

	/** macro for Number ^ Number */
	pow<T extends Number>(this: T, Number: Number): T;
	/** macro for Number ^ Value */
	pow<T extends Number>(this: T, val: Value): T;

	/** macro for Number % Number */
	mod<T extends Number>(this: T, Number: Number): T;
	/** macro for Number % Value */
	mod<T extends Number>(this: T, val: Value): T;

	/** macro for Number == Number */
	equals<T extends Number>(this: T, Number: Number): boolean;
	/** macro for Number == Value */
	equals<T extends Number>(this: T, val: Value): boolean;
	/** macro for Number == Number */
	eq<T extends Number>(this: T, Number: Number): boolean;
	/** macro for Number == Value */
	eq<T extends Number>(this: T, val: Value): boolean;

	/** macro for Number < Number */
	lt<T extends Number>(this: T, Number: Number): boolean;
	/** macro for Number < Value */
	lt<T extends Number>(this: T, val: Value): boolean;

	/** macro for Number <= Number */
	le<T extends Number>(this: T, Number: Number): boolean;
	/** macro for Number <= Value */
	le<T extends Number>(this: T, val: Value): boolean;

	/** macro for Number <= Number */
	le<T extends Number>(this: T, Number: Number): boolean;
	/** macro for Number <= Value */
	le<T extends Number>(this: T, val: Value): boolean;

	/** macro for the unary -Number operator */
	unm<T extends Number>(this: T): T;

	/** macro for Number..value */
	concat<T extends Number>(this: T, value: unknown): string;

	/**
	 * Attempts to return the constructed number converted into a regular number. If the constructed number is above 1e+308 it will instead return INF.
	 * 
	 * ```lua
	 * print(InfiniteMath.new("1, 3"):Reverse()) -- 1000
	 * ```
	 * 
	 * @method Reverse
	 * @return number
	 */
	Reverse<T extends Number>(this: T): number;

	/**
	 * Returns a string with the number and a suffix at the end, these suffixes will go up to 1e+12000. After, it will default to returning scientific notation.
	 * 
	 * By default, it will return an abbreviated suffix (1K). Using true will use the default behavior. Using false will return the full suffix (1 Thousand).
	 * 
	 * ```lua
	 * print(InfiniteMath.new(1000):GetSuffix()) -- 1K
	 * print(InfiniteMath.new(1000):GetSuffix(true)) -- 1K
	 * print(InfiniteMath.new(1000):GetSuffix(false)) -- 1 Thousand
	 * ```
	 * 
	 * @method GetSuffix
	 * @param abbreviation boolean | nil
	 * @return string
	 * 
	 */
	GetSuffix<T extends Number>(this: T): string;

	/**
	 * Returns a string with the number formatted in scientific notation.
	 * ```lua
	 * print(InfiniteMath.new(1000):ScientificNotation()) -- 1e+3
	 * ```
	 * 
	 * When a number reaches `1e+1000000` you can choose an abbreviation mode for the amount of zeros in the scientific notation. By default, it will use GetSuffix on the exponent `1e+1M`, but you can also choose to have it use scientific notation `1e+1e+6`.
	 * ```lua
	 * print(InfiniteMath.new("1, 1e+6"):ScientificNotation()) -- 1e+1M
	 * print(InfiniteMath.new("1, 1e+6"):ScientificNotation(true)) -- 1e+1M
	 * print(InfiniteMath.new("1, 1e+6"):ScientificNotation(false)) -- 1e+1e+6
	 * ```
	 * You can also use nil and false to stop the functionality and instead just display `1e+1000000`.
	 * ```lua
	 * print(InfiniteMath.new("1, 1e+6"):ScientificNotation(nil, false)) -- 1e+1000000
	 * ```
	 * 
	 * @method ScientificNotation
	 * @param abbreviation boolean | nil
	 * @param secondAbbreviation boolean | nil
	 * @return string
	 */
	ScientificNotation<T extends Number>(this: T): string;

	/**
	 * Returns a string with the number formatted in logarithmic notation.
	 * 
	 * ```lua
	 * print(InfiniteMath.new(1000):ScientificNotation()) -- e3.0
	 * ```
	 * 
	 * @method LogarithmNotation
	 * @return string
	 */
	LogarithmNotation<T extends Number>(this: T): string;

	/**
	 * Returns a string with the number formatted in double letter notation.
	 * 
	 * ```lua
	 * print(InfiniteMath.new(1e+15):aaNotation()) -- 1aa
	 * ```
	 * 
	 * @method aaNotation
	 * @return string
	 */
	aaNotation<T extends Number>(this: T): string;
	
	/**
	 * Returns a number that you can use for OrderedDataStores in order to create global leaderboards that support InfiniteMath constructed numbers.
	 * 
	 * ```lua
	 * print(InfiniteMath.new(1000):ConvertForLeaderboards()) -- 31000
	 * ```
	 * 
	 * @method ConvertForLeaderboards
	 * @return number
	 */
	ConvertForLeaderboards<T extends Number>(this: T): number;
}

declare interface InfiniteMath extends Number {
	
}

type Value = number | string | [number, number];

interface InfiniteMathConstructor {
	/**
	 * Returns a new InfiniteMath constructed number
	 * 
	 * You can use numbers `1`, correctly formatted strings `"1,0"`, tables `{1, 0}`, and other constructed numbers `InfiniteMath.new(1)`.
	 * 
	 * ```lua
	 * print(InfiniteMath.new(1)) -- 1
	 * ```
	 * 
	 * To create a number above 1e+308, we can use strings or tables.
	 * ```lua
	 * print(InfiniteMath.new("1,1000")) -- 10DTL
	 * print(InfiniteMath.new({1, 1000})) -- 10DTL
	 * ```
	 * 
	 * @param val number | string | table | Number
	 * @return Number
	 */
	new(val: Value | InfiniteMath): InfiniteMath;

	ConvertFromLeaderboards(GivenNumber: number): InfiniteMath;
		
	useScientific: (useScientific: boolean) => void;

	/**
	 * @within InfiniteMath
	 * 
	 * Rounds a number down to the nearest integer
	 * 
	 * @param Num number | string | table | Number
	 * @return Number
	 */
	floor: (Num: Value | Number) => Number;

	/**
	 * @within InfiniteMath
	 * 
	 * Rounds a number to the nearest integer
	 * 
	 * @param Num number | string | table | Number
	 * @return Number
	 */
	round: (Num: Value | Number) => Number;

	/**
	 * @within InfiniteMath
	 * 
	 * Rounds a number up to the nearest integer
	 * 
	 * @param Num number | string | table | Number
	 * @return Number
	 */
	ceil: (Num: Value | Number) => Number;

	/**
	 * @within InfiniteMath
	 * 
	 * Returns the absolute value (distance from 0)
	 * 
	 * @param Num number | string | table | Number
	 * @return Number
	 */
	abs: (Num: Value | Number) => Number;

	/**
	 * @within InfiniteMath
	 * 
	 * Clamps a number between a minimum and maximum value
	 * 
	 * @param Num number | string | table | Number
	 * @param Min number | string | table | Number
	 * @param Max number | string | table | Number
	 * @return Number
	 */
	clamp: (Num: Value | Number, Min: Value | Number, Max: Value | Number) => Number;

	/**
	 * @within InfiniteMath
	 * 
	 * Returns the smallest number among the given arguments
	 * 
	 * @param Values number | string | table | Number
	 * @return Number
	 */
	min: (...Values: (Value | Number)[]) => Number;

	/**
	 * @within InfiniteMath
	 * 
	 * Returns the largest number among the given arguments
	 * 
	 * @param Values number | string | table | Number
	 * @return Number
	 */
	max: (...Values: (Value | Number)[]) => Number;

	/**
	 * @within InfiniteMath
	 * 
	 * Returns the sign of the number. Negative numbers return -1, positive numbers return 1, 0 returns 0.
	 * 
	 * @param Num number | string | table | Number
	 * @return number
	 */
	sign: (Num: Value | Number) => number;

	/**
	 * @within InfiniteMath
	 * 
	 * Returns the square root of a number
	 * 
	 * @param Num number | string | table | Number
	 * @return Number
	 */
	sqrt: (Num: Value | Number) => Number;

	/**
	 * @within InfiniteMath
	 * 
	 * Returns the remainder of the division of a by b that rounds the quotient towards zero.
	 * 
	 * @param a number | string | table | Number
	 * @param b number | string | table | Number
	 * @return Number
	 */
	fmod: (a: Value | Number, b: Value | Number) => Number;

	/**
	 * @within InfiniteMath
	 * 
	 * Returns both the integral part of n and the fractional part (if there is one). 
	 * 
	 * @param Num number | string | table | Number
	 * @return Number
	 */
	modf: (Num: Value | Number) => Number;

	/**
	 * @within InfiniteMath
	 * 
	 * Returns the logarithm of x with the given base. Default base is constant e (2.7182818)
	 * 
	 * @param Num number | string | table | Number
	 * @param Base number
	 * @return Number
	 */
	log: (Num: Value | Number, Base: number) => Number;

	/**
	 * @within InfiniteMath
	 * 
	 * Returns the base-10 logarithm of x.
	 * 
	 * @param Num number | string | table | Number
	 * @return Number
	 */
	log10: (Num: Value | Number) => Number;
}

declare const InfiniteMath: InfiniteMathConstructor;

export = InfiniteMath;