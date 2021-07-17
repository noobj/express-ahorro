import Vue from 'vue';
import Main from './Main.vue';
import './app.scss';
import './app.css';
import { BootstrapVue } from 'bootstrap-vue';

Vue.use(BootstrapVue);
Vue.filter('toCurrency', (value: number) => {
    if (typeof value !== 'number') {
        return value;
    }
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    });
    return formatter.format(value);
});

new Vue({
    render: (h) => h(Main)
}).$mount('#main');
