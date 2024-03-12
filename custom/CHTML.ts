//com ajuda de AI
//Começo da criação de um sistema inspirado no react
export class CustomHtml {
    _element: string;
    _file: string;
    html: string | undefined;
    _replace: string;
    constructor(element: string, file: string, replace: string) {
        this._element = element;
        this._file = file;
        this.html = undefined;
        this._replace = replace;
        this.build();
    }
    async build(): Promise<void> {
        try {
            const RFile = await Deno.readFile(this._file);
            this.html = new TextDecoder().decode(RFile);
            this.html = this.html.replace(`<${this._replace}/>`, this._element);
        } catch (error) {
            throw new Error(`Error reading file: ${error}`);
        }
    }
    get value(): string | undefined {
        return this.html;
    }
}