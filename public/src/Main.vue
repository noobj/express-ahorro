<template>
    <div id="app">
        <div style="display: inline-block">
            <input
                type="image"
                src="./favicon-96x96.png"
                onclick="window.location.reload();"
                class="float-left mr-1.5 ml-1.5 w-10"
            />
            <div style="float: left">
                <input
                    class="text-black"
                    v-model="start"
                    @change="fetchEntries"
                    type="text"
                    placeholder="YYYY-MM-DD"
                    autocomplete="off"
                />
                <b-form-datepicker
                    button-only
                    @change="fetchEntries"
                    name="start"
                    v-model="start"
                    class="mb-2"
                />
            </div>
            <font face="Comic sans MS" size="5" style="float: left; font-weight: bold"
                >&nbsp;&raquo;&nbsp;</font
            >
            <div style="float: left">
                <input
                    class="text-black"
                    v-model="end"
                    type="text"
                    placeholder="YYYY-MM-DD"
                    autocomplete="off"
                />
                <b-form-datepicker button-only name="end" v-model="end" class="mb-2" />
            </div>
            <font size="4" style="float: left; font-weight: bold"
                >&nbsp;SortBy:&nbsp;</font
            >
            <b-button
                size="sm"
                pill
                variant="warning"
                @click="entriesSortByDate = !entriesSortByDate"
                style="font-weight: bold"
                >{{ entriesSortByDate ? 'Date' : 'Amount' }}</b-button
            >
            <b-button
                size="sm"
                pill
                variant="primary"
                @click="lastMonth()"
                style="font-weight: bold"
                >Last Month</b-button
            >
            <b-button
                size="sm"
                pill
                variant="info"
                @click="nextMonth()"
                style="font-weight: bold"
                >Next Month</b-button
            >
            <b-button
                size="sm"
                pill
                variant="success"
                @click="yearlyDisplay()"
                style="font-weight: bold"
                >Yearly</b-button
            >
            <b-button
                size="sm"
                pill
                variant="danger"
                @click="logout()"
                style="font-weight: bold"
                >Logout</b-button
            >
        </div>
        <h1 class="text-3xl font-bold">Total: {{ total | toCurrency }}</h1>
        <h1 v-if="total == null">Loading...</h1>

        <div>
            <Yearlychart
                v-if="!skipQuery"
                :style="myStyles"
                :chart-data="yearlyCollection"
                :options="options"
            ></Yearlychart>
        </div>
        <div style="max-width: 600px; margin: 75px; float: left">
            <Chart :chart-data="datacollection"></Chart>
        </div>
        <Category
            @active-category="activeCategory"
            @exclude-category="excludeCategory"
            v-for="category in categories"
            :key="category._id"
            :category="category"
            :active-cat="activeCat"
            :total="total"
        ></Category>
    </div>
</template>

<script lang="ts">
import moment from 'moment';
import Category from './components/Category.vue';
import Chart from './components/Chart.vue';
import axios from 'axios';
import Yearlychart from './components/YearlyChart.vue';
import { fetchOrRefreshAuth } from './helper';

export default {
    name: 'Main',
    components: {
        Category,
        Chart,
        Yearlychart
    },
    data() {
        return {
            categories: null,
            total: null,
            start: moment().startOf('month').format('YYYY-MM-DD'),
            end: moment().endOf('month').format('YYYY-MM-DD'),
            datacollection: {},
            randomColorsArr: null,
            entriesSortByDate: false,
            categoriesExclude: new Set(),
            yearlyCollection: {},
            skipQuery: true,
            activeCat: -1,
            yearDisplay: '2020',
            myStyles: {
                height: '300px',
                width: '100%',
                position: 'relative'
            },
            options: {
                legend: {
                    display: false
                },
                responsive: true,
                maintainAspectRatio: false
            }
        };
    },
    methods: {
        loadNewData() {
            return axios
                .get('https://192.168.56.101:3000/load')
                .then((res) => {
                    window.open(res.data);
                })
                .catch(() => {
                    alert('something wrong.');
                });
        },
        randomColors(size) {
            const result = [];
            for (let i = 0; i < size; i++) {
                const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                result.push(color);
            }

            return result;
        },
        excludeCategory(id) {
            this.categoriesExclude.add(id);
            this.fetchEntries();
        },
        activeCategory(id) {
            if (this.activeCat === id) id = -1;
            this.activeCat = id;
        },
        lastMonth() {
            this.categoriesExclude.clear();
            if (this.isSameMonth()) {
                this.start = moment(this.end)
                    .subtract(1, 'months')
                    .startOf('month')
                    .format('YYYY-MM-DD');
                this.end = moment(this.end)
                    .subtract(1, 'months')
                    .endOf('month')
                    .format('YYYY-MM-DD');
            } else {
                this.start = moment(this.start).startOf('month').format('YYYY-MM-DD');
                this.end = moment(this.start).endOf('month').format('YYYY-MM-DD');
            }

            this.skipQuery = true;
            this.activeCat = -1;
            this.fetchEntries();
        },
        nextMonth() {
            this.categoriesExclude.clear();
            if (this.isSameMonth()) {
                this.start = moment(this.end)
                    .add(1, 'months')
                    .startOf('month')
                    .format('YYYY-MM-DD');
                this.end = moment(this.end)
                    .add(1, 'months')
                    .endOf('month')
                    .format('YYYY-MM-DD');
            } else {
                this.start = moment(this.end).startOf('month').format('YYYY-MM-DD');
                this.end = moment(this.end).endOf('month').format('YYYY-MM-DD');
            }

            this.yearDisplay = moment(this.end).endOf('year').format('YYYY');
            this.skipQuery = true;
            this.activeCat = -1;
            this.fetchEntries();
        },
        isSameMonth() {
            return moment(this.start).format('MM') === moment(this.end).format('MM');
        },
        yearlyDisplay() {
            if (this.skipQuery) {
                this.start = moment(this.end).startOf('year').format('YYYY-MM-DD');
                this.end = moment(this.end).endOf('year').format('YYYY-MM-DD');
                this.yearDisplay = moment(this.end).endOf('year').format('YYYY');
            }

            this.skipQuery = !this.skipQuery;
        },
        fetchEntries() {
            const params = new URLSearchParams();
            params.set('timeStart', this.start);
            params.set('timeEnd', this.end);
            params.set(
                'categoriesExclude',
                Array.from(this.categoriesExclude).toString()
            );
            params.set('entriesSortByDate', this.entriesSortByDate);

            fetchOrRefreshAuth(`/entries?${params.toString()}`)
                .then((res) => res.json())
                .then((r) => {
                    this.categories = r.categories;
                    this.total = r.total;

                    const categoryNames = this.categories.map((v) => v.name);
                    const categoryPercent = this.categories.map((v) => v.percentage);
                    const categoryColors = this.categories.map((v) => v.color);

                    this.datacollection = {
                        labels: categoryNames,
                        datasets: [
                            {
                                label: 'Data One',
                                backgroundColor: categoryColors,
                                data: categoryPercent
                            }
                        ]
                    };
                });
        },
        logout() {
            fetchOrRefreshAuth('/auth/logout', { method: 'POST' }).then((res) => {
                if (res.status === 200) window.location.href = '/login.html';
            });
        }
    },
    watch: {
        entriesSortByDate() {
            this.fetchEntries();
        }
    },
    mounted() {
        this.fetchEntries();
    }
};
</script>
