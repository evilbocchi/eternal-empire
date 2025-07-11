//!native

class Difficulty {

    static DIFFICULTIES = new Map<string, Difficulty>();

    static Bonuses = Difficulty.registerDifficulty(
        new Difficulty("Bonuses")
        .setName("Bonuses")
        .setImage(0)
        .setColor(Color3.fromRGB(255, 252, 89))
        .setRating(-1000000011)
        .setClass(-3)
    );

    static Excavation = Difficulty.registerDifficulty(
        new Difficulty("Excavation")
        .setName("Materials")
        .setImage(0)
        .setColor(Color3.fromRGB(110, 166, 255))
        .setRating(-1000000012)
        .setClass(-3)
    );
    
    static Miscellaneous = Difficulty.registerDifficulty(
        new Difficulty("Miscellaneous")
        .setName("Miscellaneous")
        .setImage(17790114135)
        .setColor(Color3.fromRGB(255, 110, 110))
        .setRating(-1000000013)
        .setClass(-3)
    );

    static TheFirstDifficulty = Difficulty.registerDifficulty(
        new Difficulty("TheFirstDifficulty")
        .setName("The First Difficulty")
        .setImage(13521197654)
        .setColor(Color3.fromRGB(0, 0, 0))
        .setRating(-10000010)
        .setClass(-2)
    );

    static TheLowerGap = Difficulty.registerDifficulty(
        new Difficulty("TheLowerGap")
        .setName("The Lower Gap")
        .setImage(16500432025)
        .setColor(Color3.fromRGB(0, 79, 0))
        .setRating(-10000009)
        .setClass(-2)
    );

    static Negativity = Difficulty.registerDifficulty(
        new Difficulty("Negativity")
        .setName("Negativity")
        .setImage(11996464962)
        .setColor(Color3.fromRGB(146, 36, 143))
        .setRating(-10000008)
        .setClass(-2)
    );

    static Unimpossible = Difficulty.registerDifficulty(
        new Difficulty("Unimpossible")
        .setName("Unimpossible")
        .setImage(16623639157)
        .setColor(Color3.fromRGB(192, 0, 255))
        .setRating(-10000007)
        .setClass(-2)
    );

    static Friendliness = Difficulty.registerDifficulty(
        new Difficulty("Friendliness")
        .setName("Friendliness")
        .setImage(15380381686)
        .setColor(Color3.fromRGB(130, 253, 0))
        .setRating(-10000006)
        .setClass(-2)
    );
        
    static TrueEase = Difficulty.registerDifficulty(
        new Difficulty("TrueEase")
        .setName("True Ease")
        .setImage(7851469193)
        .setColor(Color3.fromRGB(255, 255, 255))
        .setRating(-10000005)
        .setClass(-1)
    );

    static A = Difficulty.registerDifficulty(
        new Difficulty("A")
        .setName("A")
        .setImage(7690507721)
        .setColor(Color3.fromRGB(235, 26, 36))
        .setRating(-10000004)
        .setClass(-1)
    );

    static FelixTheA = Difficulty.registerDifficulty(
        new Difficulty("FelixTheA")
        .setName("Felix the ДА")
        .setImage(16420667835)
        .setColor(Color3.fromRGB(77, 255, 0))
        .setRating(-10000003)
        .setClass(-1)
    );

    static Exist = Difficulty.registerDifficulty(
        new Difficulty("Exist")
        .setName("Exist")
        .setImage(16420694167)
        .setColor(Color3.fromRGB(255, 255, 255))
        .setRating(-10000002)
        .setClass(-1)
    );

    static ReversedPeripherality = Difficulty.registerDifficulty(new Difficulty("ReversedPeripherality")
        .setName("Reversed Peripherality")
        .setImage(16006133166)
        .setColor(Color3.fromRGB(127, 95, 140))
        .setRating(-10000001)
        .setClass(-1)
    );
    
    static Relax = Difficulty.registerDifficulty(new Difficulty("Relax")
        .setName("Relax")
        .setImage(13054817910)
        .setColor(Color3.fromRGB(255, 255, 255))
        .setRating(-1000000)
        .setClass(-1)
    );

    static Skip = Difficulty.registerDifficulty(new Difficulty("Skip")
        .setName("Skip")
        .setImage(7662792899)
        .setColor(Color3.fromRGB(255, 172, 101))
        .setRating(-1000)
        .setClass(-1)
    );
        
    static Restful = Difficulty.registerDifficulty(new Difficulty("Restful")
        .setName("Restful")
        .setImage(15097557171)
        .setColor(Color3.fromRGB(4, 61, 1))
        .setRating(-50)
        .setClass(-1)
    );

    static Ifinity = Difficulty.registerDifficulty(new Difficulty("Ifinity")
        .setName("Ifinity")
        .setImage(11622168387)
        .setColor(Color3.fromRGB(35, 7, 51))
        .setRating(-40)
        .setClass(-1)
    );

    static InstantWin = Difficulty.registerDifficulty(new Difficulty("InstantWin")
        .setName("Instant Win")
        .setImage(16421451231)
        .setColor(Color3.fromRGB(0, 46, 255))
        .setRating(-31)
        .setClass(-1)
    );

    static Millisecondless = Difficulty.registerDifficulty(new Difficulty("Millisecondless")
        .setName("Millisecondless")
        .setImage(16421468207)
        .setColor(Color3.fromRGB(244, 112, 254))
        .setRating(-30)
        .setClass(0)
    );

    static Astronomical = Difficulty.registerDifficulty(new Difficulty("Astronomical")
        .setName("Astronomical")
        .setImage(17441599695)
        .setColor(Color3.fromRGB(21, 0, 186))
        .setRating(-29.5)
        .setClass(0)
    );

    static Win = Difficulty.registerDifficulty(new Difficulty("Win")
        .setName("Win")
        .setImage(6382362791)
        .setColor(Color3.fromRGB(39, 119, 232))
        .setRating(-29)
        .setClass(0)
    );

    static Winsome = Difficulty.registerDifficulty(new Difficulty("Winsome")
        .setName("Winsome")
        .setImage(14081287986)
        .setColor(Color3.fromRGB(106, 205, 255))
        .setRating(-28)
        .setClass(0)
    );

    static DoNothing = Difficulty.registerDifficulty(new Difficulty("DoNothing")
        .setName("Do Nothing")
        .setImage(7662806862)
        .setColor(Color3.fromRGB(153, 209, 229))
        .setRating(-27)
        .setClass(0)
    );
    
    static Sleepful = Difficulty.registerDifficulty(new Difficulty("Sleepful")
        .setName("Sleepful")
        .setImage(17705157889)
        .setColor(Color3.fromRGB(52, 155, 255))
        .setRating(-26.5)
        .setClass(0)
    );

    static Blessing = Difficulty.registerDifficulty(new Difficulty("Blessing")
        .setName("Blessing")
        .setImage(17705253718)
        .setColor(Color3.fromRGB(114, 224, 178))
        .setRating(-26)
        .setClass(0)
    );

    static registerDifficulty<T extends Difficulty>(difficulty: T) {
        Difficulty.DIFFICULTIES.set(difficulty.id, difficulty);
        return difficulty;
    }

    static getDifficulty(difficultyId: string) {
        return Difficulty.DIFFICULTIES.get(difficultyId);
    }

    id: string;
    name: string | undefined = undefined;
    class: number | undefined = undefined;
    rating: number | undefined = undefined;
    color: Color3 | undefined = undefined;
    image: number | undefined = undefined;

    constructor(id: string) {
        this.id = id;
    }

    setName(name: string) {
        this.name = name;
        return this;
    }

    setClass(difficultyClass: number) {
        this.class = difficultyClass;
        return this;
    }

    setRating(rating: number) {
        this.rating = rating;
        return this;
    }

    setColor(color: Color3) {
        this.color = color;
        return this;
    }

    setImage(image: number) {
        this.image = image;
        return this;
    }
}

export = Difficulty;