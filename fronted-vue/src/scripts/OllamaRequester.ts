import axios from "axios";
import { Message, MissingModel } from "./shemas";

export class OllamaRequester {
  listModelsUrl: string;
  pullModelUrl: string;
  nededModels: Array<string>;
  mittEmitter: any;
  generateUrl: string;

  constructor() {
    this.listModelsUrl = process.env.VUE_APP_OLLAMA_URL + "/api/tags";
    this.pullModelUrl = process.env.VUE_APP_OLLAMA_URL + "/api/pull";
    this.generateUrl = process.env.VUE_APP_OLLAMA_URL + "/api/generate";
    this.nededModels = ["llama2", "llava"];
  }

  setMittEmmiter(mittEmitter: any) {
    this.mittEmitter = mittEmitter;
  }

  async updateMissingModel(): Promise<Array<string>> {
    return await axios
      .get(this.listModelsUrl)
      .then((res) => {

        const availableModels = res.data.models.map(
          (model: { name: string }) => model.name.split(":")[0]
        );
        const missingModels = this.nededModels.filter(
          (model) => !availableModels.includes(model)
        );

        localStorage.setItem("missingModelsNames", missingModels.toString());

        return missingModels;
      })
      .catch((error) => {
        console.log(`models:${error}`);
        throw error;
      });
  }

  async downloadAllMissingModels(models: Array<MissingModel>): Promise<string> {
    for (const model of models) {
      console.log(model);
      await this.downloadMissingModel(model.name);
    }
    this.mittEmitter.emit("downloadMissingModelsDone");

    return "All models have been downloaded.";
  }

  async downloadMissingModel(model: string): Promise<string> {
    try {
      const response = await fetch(this.pullModelUrl, {
        method: "POST",
        body: JSON.stringify({ name: model }),
      });

      if (response.body === null) throw new Error("response body is empty!");
      const reader = response.body.getReader();

      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        result = new TextDecoder("utf-8").decode(value);

        this.mittEmitter.emit("downloadMissingModels", { model, result });
      }
      console.log("Stream processing complete");

   

      


      return result;
    } catch (error) {
      console.error("Error streaming data:", error);
      throw error;
    }
  }

  async sendMessage(message: Message) {
    try {
      const response = await fetch(this.generateUrl, {
        method: "POST",
        body: JSON.stringify(message),
      });

      if (response.body === null) throw new Error("response body is empty!");
      const reader = response.body.getReader();

      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        result = new TextDecoder("utf-8").decode(value);


        this.mittEmitter.emit("generateMessage", result);
      }
      // console.log("Stream processing complete");
      this.mittEmitter.emit("generateMessageDone");
      return result;
    } catch (error) {
      console.error("Error streaming data:", error);
      throw error;
    }
  }
}
