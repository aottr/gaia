import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip
);
import { Line } from 'react-chartjs-2';


export default ({ weightData }: { weightData: any }) => {

    const chartData = {
        labels: weightData ? weightData.map((item: any) => new Date(item.date).toLocaleDateString('en-ca')) : [],
        datasets: [
            {
                label: 'Weight in grams',
                data: weightData ? weightData.map((item: any) => item.value) : [],
                tension: 0.4,
                borderColor: 'rgb(191, 149, 249)',
                backgroundColor: 'rgba(191, 149, 249, 0.5)',
                pointStyle: 'rectRounded',
                pointRadius: 10,
                pointHoverRadius: 15
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        maintainAspectRatio: false,
        scales: {
            x: {
                ticks: {
                    color: 'white',
                }
            },
            y: {
                ticks: {
                    color: 'white',
                }
            }
        }
    };

    return (
        <div className='max-h-60'>
            <Line data={chartData} options={chartOptions} />
        </div>
    )
}