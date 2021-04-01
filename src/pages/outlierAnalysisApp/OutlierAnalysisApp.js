import { PureComponent } from 'react';

let count = 0;
class OutlierAnalysisApp extends PureComponent {
    render() {
        function gotoLink() {
            if (count === 0) {
                count = 1;
                window.open('../api/apps/Outlier-Analysis/index.html', '_blank');
                // window.location.assign('../dhis-web-data-quality/index.action#/');
                setInterval(window.location.assign('../dhis-web-data-quality/index.action#/'), 10000);
            }
            return true;
        }
        return (
            gotoLink()
        );
    }
}

export default OutlierAnalysisApp;
