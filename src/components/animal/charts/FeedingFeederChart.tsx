import {
    Chart as ChartJS,
    ArcElement, Tooltip, Legend
} from 'chart.js';

ChartJS.register(
    ArcElement, Tooltip, Legend
);
import { Doughnut } from 'react-chartjs-2';


export default ({ weightData }: { weightData: any }) => {

    const chartData = {
        labels: weightData ? weightData.map((item: any) => new Date(item.date).toLocaleDateString('en-ca')) : [],
        datasets: [
            {
                label: 'Weight in grams',
                data: weightData ? weightData.map((item: any) => item.value) : [],
                backgroundColor: [
                    'rgba(234, 93, 171, 0.7)',
                    'rgba(152, 108, 240, 0.7)',
                    'rgba(241, 162, 75, 0.7)',
                    'rgba(237, 122, 188, 0.7)',
                    'rgba(175, 141, 243, 0.7)'
                ],
                borderColor: 'rgba(0, 0, 0, 0.3)'
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            title: {
                display: false,
            },
        },
        maintainAspectRatio: false,

    };

    return (
        <div className='max-h-60'>
            <Doughnut data={chartData} options={chartOptions} />
        </div>
    )
}