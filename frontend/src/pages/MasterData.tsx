import { useState, useEffect } from 'react';
import Category from './Master';
import SubCategory from './SubCategory';
import IDType from './IDType';
import BioData from './BioData';
import SubName from './SubName';

type TabType = 'category' | 'subcategory' | 'idtype' | 'biodata' | 'subname';

interface MasterDataProps {
    activeNav?: string;
}

export default function MasterData({ activeNav }: MasterDataProps) {

    const getTabFromNav = (nav?: string): TabType => {

        if (!nav) return 'category';
        const tabMap: Record<string, TabType> = {
            'master-category': 'category',
            'master-subcategory': 'subcategory',
            'master-idtype': 'idtype',
            'master-biodata': 'biodata',
            'master-subname': 'subname',
            'master': 'category',
        };

        return tabMap[nav] || 'category';
    };

    const [activeTab, setActiveTab] = useState<TabType>(() => getTabFromNav(activeNav));

    useEffect(() => {
        setActiveTab(getTabFromNav(activeNav));
    }, [activeNav]);

    return (
        <div className="MD-wrapper" style={{ height: '100%' }}>
            <div className="MD-content" style={{ height: '100%', overflow: 'auto' }}>
                {activeTab === 'category' && <Category />}
                {activeTab === 'subcategory' && <SubCategory />}
                {activeTab === 'idtype' && <IDType />}
                {activeTab === 'biodata' && <BioData />}
                {activeTab === 'subname' && <SubName />}
            </div>
        </div>
    );
}