import Vue from 'vue';
import Main from './Main';
import './app.scss';
import './app.css';
import { BootstrapVue } from 'bootstrap-vue';

Vue.use(BootstrapVue);
Vue.filter('toCurrency', function (value) {
    if (typeof value !== "number") {
        return value;
    }
    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0
    });
    return formatter.format(value);
});

new Vue({
    render: h => h(Main)
  }).$mount('#main')
