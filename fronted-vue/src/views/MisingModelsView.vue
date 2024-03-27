<template>
    <div class="main_container">
        <HeaderComponent />

        <div class="h-20"></div>

        <div v-if="hideMissingModelBox" class="w-full h-screen flex flex-col items-center ">

            <div class="warning-message ">
                <div class="w-90  flex items-center justify-center bg-blue-500 text-white text-sm font-bold px-4 py-3"
                    role="alert">
                    <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path
                            d="M12.432 0c1.34 0 2.01.912 2.01 1.957 0 1.305-1.164 2.512-2.679 2.512-1.269 0-2.009-.75-1.974-1.99C9.789 1.436 10.67 0 12.432 0zM8.309 20c-1.058 0-1.833-.652-1.093-3.524l1.214-5.092c.211-.814.246-1.141 0-1.141-.317 0-1.689.562-2.502 1.117l-.528-.88c2.572-2.186 5.531-3.467 6.801-3.467 1.057 0 1.233 1.273.705 3.23l-1.391 5.352c-.246.945-.141 1.271.106 1.271.317 0 1.357-.392 2.379-1.207l.6.814C12.098 19.02 9.365 20 8.309 20z" />
                    </svg>
                    <p>Models are not loaded, please click the button</p>
                </div>
            </div>


            <div class="missing-models-box p-6  text-white">
                <table class="table-auto w-full bg-gray-800">

                    <thead>
                        <tr class="bg-gray-700 text-white uppercase text-sm leading-normal">
                            <th class="py-3 px-6 text-left">ai model</th>
                            <th class="py-3 px-6 text-left">size of model</th>
                            <th class="py-3 px-6 text-left">progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="model in missingModels" :key="model.name" class="text-white text-sm font-light">
                            <td class="py-3 px-6 border-b border-gray-700">{{ model.name }}</td>
                            <td class="py-3 px-6 border-b border-gray-700">{{ model.sizeModel }}</td>
                            <td class="py-3 px-6 border-b border-gray-700">{{ model.PercentageStatus }}%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <button @click="startDownloadModels"
                class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                Downloads the models
            </button>

        </div>

        <div class="flex flex-col items-center" v-else>
            <p class="w-full text-center py-4 text-2xl font-bold text-green-500">
                All models have been downloaded!
            </p>

            <button @click="goBack" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Go Back
            </button>



        </div>
    </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import mitt from 'mitt';

import HeaderComponent from "@/components/HeaderComponent.vue"
import { OllamaRequester } from '@/scripts/OllamaRequester';
import { MissingModel } from '@/scripts/shemas';

export default defineComponent({
    components: {
        HeaderComponent
    },
    data() {
        return {
            missingModels: [] as Array<MissingModel>,
            ollamaRequester: new OllamaRequester(),
            mittEmitter: mitt(),
            hideMissingModelBox: false
        }
    },
    beforeMount() {
        this.getMissingModels()
        this.checkMissingModels()
        this.ollamaRequester.setMittEmmiter(this.mittEmitter);
        this.mittEmitter.on('downloadMissingModels', e => this.downloadMissingModels(e))
        this.mittEmitter.on('downloadMissingModelsDone', () => this.downloadMissingModelsDone())

    },
    methods: {
        startDownloadModels() {
            this.ollamaRequester.downloadAllMissingModels(this.missingModels);
        },

        downloadMissingModelsDone() {
            this.missingModels = []
            this.checkMissingModels()
        },

        downloadMissingModels(data: any) {
            try {
                const jsonData = JSON.parse(data.result);
                const percentage = (jsonData.completed / jsonData.total) * 100;
                const sizeInMB = jsonData.total / (1024 * 1024);
                const sizeInGB = sizeInMB / 1024;



                if (!isNaN(percentage)) {
                    for (const model of this.missingModels) {


                        if (jsonData.total > 0) {
                            model.sizeModel = `${jsonData.total / (1024 * 1024)}`;
                        } else {
                            console.error('Invalid total size');
                        }

                        if (model.name === data.model) {
                            model.PercentageStatus = percentage.toFixed(2);
                            model.sizeModel = sizeInMB > 1024 ? `${sizeInGB.toFixed(2)} GB` : `${sizeInMB.toFixed(2)} MB`;
                        }
                    }
                }
            } catch (e) { }
        },


        getMissingModels() {
            this.ollamaRequester.updateMissingModel()
            const missingModels = localStorage.getItem('missingModelsNames');
            const missingModelsNames = missingModels?.split(",") as Array<string>

            for (const modelName of missingModelsNames) {
                const missingModel: MissingModel = {
                    name: modelName,
                    PercentageStatus: "",
                    sizeModel: ""
                }
                this.missingModels.push(missingModel)
            }

        },
        goBack() {
            this.$router.go(-1);
        },

        checkMissingModels() {
            this.ollamaRequester.updateMissingModel()
            const missingModels = localStorage.getItem('missingModelsNames');
            if (missingModels !== "") {
                this.hideMissingModelBox = true
            }
        }

    }
})



</script>


<style>
@import "@/assets/css/missing-model-view.css";
</style>