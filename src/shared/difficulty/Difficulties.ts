import Difficulty from "shared/difficulty/Difficulty";

class Difficulties {
    static DIFFICULTIES: Difficulty[] = [];

    static Bonuses = Difficulties.registerDifficulty(
        new Difficulty("Bonuses")
        .setName("Bonuses")
        .setImage(0)
        .setColor(Color3.fromRGB(255, 252, 89))
        .setRating(-1000000011)
        .setClass(-3)
    );

    static TheFirstDifficulty = Difficulties.registerDifficulty(
        new Difficulty("TheFirstDifficulty")
        .setName("The First Difficulty")
        .setImage(13521197654)
        .setColor(Color3.fromRGB(0, 0, 0))
        .setRating(-1000000010)
        .setClass(-2)
    );

    static TheLowerGap = Difficulties.registerDifficulty(
        new Difficulty("TheLowerGap")
        .setName("The Lower Gap")
        .setImage(16500432025)
        .setColor(Color3.fromRGB(0, 79, 0))
        .setRating(-1000000009)
        .setClass(-2)
    );

    static Negativity = Difficulties.registerDifficulty(
        new Difficulty("Negativity")
        .setName("Negativity")
        .setImage(11996464962)
        .setColor(Color3.fromRGB(146, 36, 143))
        .setRating(-1000000008)
        .setClass(-2)
    );

    static Unimpossible = Difficulties.registerDifficulty(
        new Difficulty("Unimpossible")
        .setName("Unimpossible")
        .setImage(16623639157)
        .setColor(Color3.fromRGB(192, 0, 255))
        .setRating(-1000000007)
        .setClass(-2)
    );

    static Friendliness = Difficulties.registerDifficulty(
        new Difficulty("Friendliness")
        .setName("Friendliness")
        .setImage(15380381686)
        .setColor(Color3.fromRGB(130, 253, 0))
        .setRating(-1000000006)
        .setClass(-2)
    );
        
    static TrueEase = Difficulties.registerDifficulty(
        new Difficulty("TrueEase")
        .setName("True Ease")
        .setImage(7851469193)
        .setColor(Color3.fromRGB(255, 255, 255))
        .setRating(-1000000005)
        .setClass(-2)
    );

    static A = Difficulties.registerDifficulty(
        new Difficulty("A")
        .setName("A")
        .setImage(7690507746)
        .setColor(Color3.fromRGB(235, 26, 36))
        .setRating(-1000000004)
        .setClass(-2)
    );

    static FelixTheA = Difficulties.registerDifficulty(
        new Difficulty("FelixTheA")
        .setName("Felix the ДА")
        .setImage(16420667835)
        .setColor(Color3.fromRGB(77, 255, 0))
        .setRating(-1000000003)
        .setClass(-2)
    );

    static Exist = Difficulties.registerDifficulty(
        new Difficulty("Exist")
        .setName("Exist")
        .setImage(16420694167)
        .setColor(Color3.fromRGB(255, 255, 255))
        .setRating(-1000000002)
        .setClass(-2)
    );

    static ReversedPeripherality = Difficulties.registerDifficulty(new Difficulty("ReversedPeripherality")
        .setName("Reversed Peripherality")
        .setImage(16006133166)
        .setColor(Color3.fromRGB(127, 95, 140))
        .setRating(-1000000001)
        .setClass(-2)
    );
    
    static Relax = Difficulties.registerDifficulty(new Difficulty("Relax")
        .setName("Relax")
        .setImage(13054817960)
        .setColor(Color3.fromRGB(255, 255, 255))
        .setRating(-1000000000)
        .setClass(-2)
    );

    static Skip = Difficulties.registerDifficulty(new Difficulty("Skip")
        .setName("Skip")
        .setImage(7662792908)
        .setColor(Color3.fromRGB(255, 172, 101))
        .setRating(-100000000)
        .setClass(-2)
    );
        
    static Restful = Difficulties.registerDifficulty(new Difficulty("Restful")
        .setName("Restful")
        .setImage(15097557184)
        .setColor(Color3.fromRGB(4, 61, 1))
        .setRating(-100000)
        .setClass(-2)
    );

    static Ifinity = Difficulties.registerDifficulty(new Difficulty("Ifinity")
        .setName("Ifinity")
        .setImage(11622168417)
        .setColor(Color3.fromRGB(35, 7, 51))
        .setRating(-1000)
        .setClass(-2)
    );

    static InstantWin = Difficulties.registerDifficulty(new Difficulty("InstantWin")
        .setName("Instant Win")
        .setImage(16421451231)
        .setColor(Color3.fromRGB(0, 46, 255))
        .setRating(-500)
        .setClass(-2)
    );

    static Millisecondless = Difficulties.registerDifficulty(new Difficulty("Millisecondless")
        .setName("Millisecondless")
        .setImage(16421468207)
        .setColor(Color3.fromRGB(244, 112, 254))
        .setRating(-100)
        .setClass(-1)
    );

    static Astronomical = Difficulties.registerDifficulty(new Difficulty("Astronomical")
        .setName("Astronomical")
        .setImage(14008721932)
        .setColor(Color3.fromRGB(21, 0, 186))
        .setRating(-85)
        .setClass(-1)
    );

    static Win = Difficulties.registerDifficulty(new Difficulty("Win")
        .setName("Win")
        .setImage(6382362796)
        .setColor(Color3.fromRGB(52, 10, 255))
        .setRating(-75)
        .setClass(-1)
    );

    static Winsome = Difficulties.registerDifficulty(new Difficulty("Winsome")
        .setName("Winsome")
        .setImage(14081288003)
        .setColor(Color3.fromRGB(106, 205, 255))
        .setRating(-50)
        .setClass(-1)
    );

    static DoNothing = Difficulties.registerDifficulty(new Difficulty("DoNothing")
        .setName("Do Nothing")
        .setImage(7662806869)
        .setColor(Color3.fromRGB(153, 209, 229))
        .setRating(-35)
        .setClass(-1)
    );
    
    static registerDifficulty<T extends Difficulty>(difficulty: T) {
        Difficulties.DIFFICULTIES.push(difficulty);
        return difficulty;
    }

    static getDifficulty(difficultyId: string) {
        for (const difficulty of Difficulties.DIFFICULTIES) {
            if (difficulty.id === difficultyId)
                return difficulty;
        }
        return undefined;
    }
}

export = Difficulties;