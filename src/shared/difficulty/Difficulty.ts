class Difficulty {
    id: string;
    name: string | undefined = undefined;
    class: number | undefined = undefined;
    rating: number | undefined = undefined;
    color: Color3 | undefined = undefined;
    image: number | undefined = undefined;

    constructor(id: string) {
        this.id = id;
    }

    getName() {
        return this.name;
    }

    setName(name: string) {
        this.name = name;
        return this;
    }

    getClass() {
        return this.class;
    }

    setClass(difficultyClass: number) {
        this.class = difficultyClass;
        return this;
    }

    getRating() {
        return this.rating;
    }

    setRating(rating: number) {
        this.rating = rating;
        return this;
    }

    getColor() {
        return this.color;
    }

    setColor(color: Color3) {
        this.color = color;
        return this;
    }

    getImage() {
        return this.image;
    }

    setImage(image: number) {
        this.image = image;
        return this;
    }
}

export = Difficulty;