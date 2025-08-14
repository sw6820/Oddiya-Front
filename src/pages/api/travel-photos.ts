import type { NextApiRequest, NextApiResponse } from 'next';

interface TravelDestination {
    id: number;
    imgURL: string;
    title: string;
    location: string;
    description: string;
    tags: string[];
}

interface TravelPhotosResponse {
    success: boolean;
    data?: TravelDestination[];
    error?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<TravelPhotosResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { destination, startDate, endDate } = req.query;

        if (!destination || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: destination, startDate, endDate'
            });
        }

        // 실제 여행지 데이터
        const travelDestinations: TravelDestination[] = [
            {
                id: 1,
                imgURL: "https://upload.wikimedia.org/wikipedia/commons/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_août_2014_%282%29.jpg",
                title: "장소1",
                location: "서울",
                description: "서울의 아름다운 장소1입니다.",
                tags: ["#장소"]
            },
            {
                id: 2,
                imgURL: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8JUVEJThDJThDJUVCJUE2JUFDfGVufDB8fDB8fHww",
                title: "장소2",
                location: "부산",
                description: "부산의 명소2입니다.",
                tags: ["맛집"]
            },
            {
                id: 3,
                imgURL: "https://thattravelista.com/wp-content/uploads/2020/08/France-Paris-13-768x1024.jpg",
                title: "장소3",
                location: "제주",
                description: "제주의 명소3입니다.",
                tags: ["카페"]
            },
            {
                id: 4,
                imgURL: "https://image.kkday.com/v2/image/get/w_960%2Cc_fit%2Cq_55%2Ct_webp/s1.kkday.com/product_102801/20200820233334_VVoGe/jpg",
                title: "장소4",
                location: "강릉",
                description: "강릉의 명소4입니다.",
                tags: ["아이와함께"]
            },
            {
                id: 5,
                imgURL: "https://mblogthumb-phinf.pstatic.net/MjAxODAzMjZfMTk3/MDAxNTIyMDY1NzM4NDcw.kDKwEwthAKMsk3p1L_ClUJ5JGC93q2WHGqTwAOupLakg.adrXt46I4NRJTy0sqYnTaOO7fEiAk77mwP8LTE1TmV4g.JPEG.tourpuzzle/shutterstock_114479500.jpg?type=w800",
                title: "장소5",
                location: "대구",
                description: "대구의 명소5입니다.",
                tags: ["체험"]
            },
            {
                id: 6,
                imgURL: "https://i.namu.wiki/i/Nm-jKEhvMEBB0NlsPoOEoYgO9kl0lG9Z3nLHlHgd-_ZaSZVGHKowA1kwirt33nWVlUFe8IlayvH6I7PxY29IRA.webp",
                title: "장소6",
                location: "광주",
                description: "광주의 명소6입니다.",
                tags: ["쇼핑"]
            },
            {
                id: 7,
                imgURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe8Xl_WTk2Ef5-N71FMGCCkT9z_MvQFc_Dhg&s",
                title: "장소7",
                location: "인천",
                description: "인천의 명소7입니다.",
                tags: ["역사"]
            },
            {
                id: 8,
                imgURL: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/aa/20/d1/the-louvre-originally.jpg?w=600&h=500&s=1",
                title: "장소8",
                location: "울산",
                description: "울산의 명소8입니다.",
                tags: ["힐링"]
            },
            {
                id: 9,
                imgURL: "https://www.agoda.com/wp-content/uploads/2019/04/Things-to-do-in-Paris-Featured-photo-1200x350-Pont-Alexandre-III.jpg",
                title: "장소9",
                location: "서울",
                description: "서울의 명소9입니다.",
                tags: ["장소"]
            },
            {
                id: 10,
                imgURL: "https://cdn.restgeo.com/static/image/detail/frantsiya/dostoprimechatelnosti-parizha/thumbnail/728x485/pantheon-paris.jpg",
                title: "장소10",
                location: "부산",
                description: "부산의 명소10입니다.",
                tags: ["맛집"]
            },
            {
                id: 11,
                imgURL: "https://watermark.lovepik.com/photo/20211207/large/lovepik-fountain-of-neptune-famous-tourist-attraction-in-picture_501565922.jpg",
                title: "장소11",
                location: "제주",
                description: "제주의 명소11입니다.",
                tags: ["아이와함께"]
            },
            {
                id: 12,
                imgURL: "https://i1.wp.com/www.agoda.com/wp-content/uploads/2019/04/Things-to-do-in-Paris-Montmarte-District-old-street.jpg",
                title: "장소12",
                location: "울산",
                description: "울산의 명소12입니다.",
                tags: ["울산"]
            },
            {
                id: 13,
                imgURL: "https://static.hubzum.zumst.com/hubzum/2024/05/11/00/8503a790af0446c88137a7a6ae507c1a.jpg",
                title: "장소13",
                location: "광주",
                description: "광주의 명소13입니다.",
                tags: ["광주"]
            },
            {
                id: 14,
                imgURL: "https://media.triple.guide/triple-cms/c_limit,f_auto,h_1024,w_1024/3aed3353-9ee0-4650-a437-fdd5067d17b3.jpeg",
                title: "장소14",
                location: "대구",
                description: "대구의 명소14입니다.",
                tags: ["대구"]
            },
            {
                id: 15,
                imgURL: "https://cdn.ceopartners.co.kr/news/photo/201903/img_bd_06_1186_0.jpg",
                title: "장소15",
                location: "서울",
                description: "서울의 명소15입니다.",
                tags: ["서울"]
            },
            {
                id: 16,
                imgURL: "https://m.imaeil.com/photos/2019/04/16/2019041608224037094_l.jpg",
                title: "장소16",
                location: "부산",
                description: "부산의 명소16입니다.",
                tags: ["부산"]
            },
            {
                id: 18,
                imgURL: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/28/cf/71/d2/caption.jpg?w=500&h=500&s=1",
                title: "장소18",
                location: "울산",
                description: "울산의 명소18입니다.",
                tags: ["울산"]
            },
            {
                id: 19,
                imgURL: "https://d2mgzmtdeipcjp.cloudfront.net/files/magazine/2024/10/22/17295870793375.jpg",
                title: "장소19",
                location: "광주",
                description: "광주의 명소19입니다.",
                tags: ["광주"]
            },
            {
                id: 20,
                imgURL: "https://previews.123rf.com/images/nito500/nito5001310/nito500131000002/22516700-paris-france-may-5-2013-tourist-at-the-sacre-coeur-basilica-in-paris-france-the-basilica-is.jpg",
                title: "장소20",
                location: "인천",
                description: "인천의 명소20입니다.",
                tags: ["인천"]
            },
            {
                id: 21,
                imgURL: "https://cdn.st-news.co.kr/news/photo/202403/9549_28900_3239.jpg",
                title: "장소21",
                location: "서울",
                description: "서울의 명소21입니다.",
                tags: ["서울"]
            },
            {
                id: 22,
                imgURL: "https://img.hankyung.com/photo/202407/PYH2024072701350001300_P4.jpg",
                title: "장소22",
                location: "부산",
                description: "부산의 명소22입니다.",
                tags: ["부산"]
            },
            {
                id: 23,
                imgURL: "https://d2mgzmtdeipcjp.cloudfront.net/files/good/2024/01/16/17053926367292.jpg",
                title: "장소23",
                location: "제주",
                description: "제주의 명소23입니다.",
                tags: ["제주"]
            },
            {
                id: 24,
                imgURL: "https://watermark.lovepik.com/photo/20211207/large/lovepik-dome-of-paris-opera-house-famous-tourist-picture_501565966.jpg",
                title: "장소24",
                location: "울산",
                description: "울산의 명소24입니다.",
                tags: ["울산"]
            },
            {
                id: 25,
                imgURL: "https://upload.wikimedia.org/wikipedia/commons/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_août_2014_%282%29.jpg",
                title: "장소25",
                location: "서울",
                description: "서울의 명소25입니다.",
                tags: ["서울"]
            },
            {
                id: 26,
                imgURL: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8JUVEJThDJThDJUVCJUE2JUFDfGVufDB8fDB8fHww",
                title: "장소26",
                location: "부산",
                description: "부산의 명소26입니다.",
                tags: ["부산"]
            },
            {
                id: 27,
                imgURL: "https://thattravelista.com/wp-content/uploads/2020/08/France-Paris-13-768x1024.jpg",
                title: "장소27",
                location: "제주",
                description: "제주의 명소27입니다.",
                tags: ["제주"]
            },
            {
                id: 28,
                imgURL: "https://image.kkday.com/v2/image/get/w_960%2Cc_fit%2Cq_55%2Ct_webp/s1.kkday.com/product_102801/20200820233334_VVoGe/jpg",
                title: "장소28",
                location: "대구",
                description: "대구의 명소28입니다.",
                tags: ["대구"]
            },
            {
                id: 29,
                imgURL: "https://mblogthumb-phinf.pstatic.net/MjAxODAzMjZfMTk3/MDAxNTIyMDY1NzM4NDcw.kDKwEwthAKMsk3p1L_ClUJ5JGC93q2WHGqTwAOupLakg.adrXt46I4NRJTy0sqYnTaOO7fEiAk77mwP8LTE1TmV4g.JPEG.tourpuzzle/shutterstock_114479500.jpg?type=w800",
                title: "장소29",
                location: "광주",
                description: "광주의 명소29입니다.",
                tags: ["광주"]
            },
            {
                id: 30,
                imgURL: "https://i.namu.wiki/i/Nm-jKEhvMEBB0NlsPoOEoYgO9kl0lG9Z3nLHlHgd-_ZaSZVGHKowA1kwirt33nWVlUFe8IlayvH6I7PxY29IRA.webp",
                title: "장소30",
                location: "인천",
                description: "인천의 명소30입니다.",
                tags: ["인천"]
            },
            {
                id: 31,
                imgURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe8Xl_WTk2Ef5-N71FMGCCkT9z_MvQFc_Dhg&s",
                title: "장소31",
                location: "울산",
                description: "울산의 명소31입니다.",
                tags: ["울산"]
            },
            {
                id: 32,
                imgURL: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/aa/20/d1/the-louvre-originally.jpg?w=600&h=500&s=1",
                title: "장소32",
                location: "서울",
                description: "서울의 명소32입니다.",
                tags: ["서울"]
            },
            {
                id: 33,
                imgURL: "https://www.agoda.com/wp-content/uploads/2019/04/Things-to-do-in-Paris-Featured-photo-1200x350-Pont-Alexandre-III.jpg",
                title: "장소33",
                location: "부산",
                description: "부산의 명소33입니다.",
                tags: ["부산"]
            },
            {
                id: 34,
                imgURL: "https://cdn.restgeo.com/static/image/detail/frantsiya/dostoprimechatelnosti-parizha/thumbnail/728x485/pantheon-paris.jpg",
                title: "장소34",
                location: "제주",
                description: "제주의 명소34입니다.",
                tags: ["제주"]
            },
            {
                id: 35,
                imgURL: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/aa/20/d1/the-louvre-originally.jpg?w=600&h=500&s=1",
                title: "장소35",
                location: "강릉",
                description: "강릉의 명소35입니다.",
                tags: ["강릉"]
            },
            {
                id: 36,
                imgURL: "https://www.agoda.com/wp-content/uploads/2019/04/Things-to-do-in-Paris-Featured-photo-1200x350-Pont-Alexandre-III.jpg",
                title: "장소36",
                location: "강릉",
                description: "강릉의 명소36입니다.",
                tags: ["강릉"]
            },
            {
                id: 37,
                imgURL: "https://cdn.restgeo.com/static/image/detail/frantsiya/dostoprimechatelnosti-parizha/thumbnail/728x485/pantheon-paris.jpg",
                title: "장소37",
                location: "강릉",
                description: "강릉의 명소37입니다.",
                tags: ["강릉"]
            },
            {
                id: 38,
                imgURL: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/aa/20/d1/the-louvre-originally.jpg?w=600&h=500&s=1",
                title: "장소38",
                location: "강릉",
                description: "강릉의 명소38입니다.",
                tags: ["강릉"]
            },
            {
                id: 39,
                imgURL: "https://www.agoda.com/wp-content/uploads/2019/04/Things-to-do-in-Paris-Featured-photo-1200x350-Pont-Alexandre-III.jpg",
                title: "장소39",
                location: "강릉",
                description: "강릉의 명소39입니다.",
                tags: ["강릉"]
            },
            {
                id: 40,
                imgURL: "https://cdn.restgeo.com/static/image/detail/frantsiya/dostoprimechatelnosti-parizha/thumbnail/728x485/pantheon-paris.jpg",
                title: "장소40",
                location: "강릉",
                description: "강릉의 명소40입니다.",
                tags: ["강릉"]
            }
        ];

        // 여행지에 맞는 사진 필터링 (간단한 예시)
        let filteredDestinations = travelDestinations;

        // 여행지가 한국 도시인 경우 해당 도시의 사진들만 필터링
        if (destination && typeof destination === 'string') {
            const koreanCities = ['서울', '부산', '제주', '강릉', '대구', '광주', '인천', '울산'];
            const isKoreanCity = koreanCities.some(city => destination.includes(city));

            if (isKoreanCity) {
                // 여행지와 일치하는 도시의 사진들만 반환
                filteredDestinations = travelDestinations.filter(item =>
                    destination.includes(item.location)
                );
            }
        }

        // 최대 20개까지만 반환 (성능 고려)
        const limitedDestinations = filteredDestinations.slice(0, 20);

        return res.status(200).json({
            success: true,
            data: limitedDestinations
        });

    } catch (error) {
        console.error('Error fetching travel photos:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
