const playersElement = document.getElementById("players");
const addPlayerButton = document.getElementById("addPlayerButton");
const teamCountElement = document.getElementById("teamCount");
const teamSizesElement = document.getElementById("teamSizes");
const divideButton = document.getElementById("divideButton");
const redrawButton = document.getElementById("redrawButton");
const resultSection = document.getElementById("resultSection");
const resultElement = document.getElementById("result");


/*
 * ランク一覧
 *
 * C-  = 1
 * C   = 2
 * C+  = 3
 * B-  = 4
 * B   = 5
 * B+  = 6
 * A-  = 7
 * A   = 8
 * A+  = 9
 * S   = 10
 * S+0 = 11
 * S+1 = 12
 * ...
 * S+50 = 61
 */

const ranks = [
    { name: "C-", value: 1 },
    { name: "C", value: 2 },
    { name: "C+", value: 3 },
    { name: "B-", value: 4 },
    { name: "B", value: 5 },
    { name: "B+", value: 6 },
    { name: "A-", value: 7 },
    { name: "A", value: 8 },
    { name: "A+", value: 9 },
    { name: "S", value: 10 }
];

for (let i = 0; i <= 50; i++) {
    ranks.push({
        name: "S+" + i,
        value: 11 + i
    });
}


/*
 * ランク選択欄を作成
 */
function createRankSelect() {

    const select = document.createElement("select");

    for (let i = 0; i < ranks.length; i++) {

        const option = document.createElement("option");

        option.value = ranks[i].value;
        option.textContent =
            ranks[i].name + " (" + ranks[i].value + ")";

        select.appendChild(option);
    }

    return select;
}


/*
 * 参加者を追加
 */
function addPlayer() {

    const player = document.createElement("div");

    player.className = "player";


    /* 名前 */
    const nameInput = document.createElement("input");

    nameInput.type = "text";
    nameInput.placeholder = "名前";


    /* ランク */
    const rankSelect = createRankSelect();


    /* 観戦チェックボックス */
    const spectatorDiv = document.createElement("div");

    spectatorDiv.className = "spectator";


    const spectatorCheck =
        document.createElement("input");

    spectatorCheck.type = "checkbox";
    spectatorCheck.className = "spectator-check";


    const spectatorLabel =
        document.createElement("label");

    spectatorLabel.textContent = "観戦";


    spectatorDiv.appendChild(spectatorCheck);
    spectatorDiv.appendChild(spectatorLabel);


    /* 削除ボタン */
    const removeButton =
        document.createElement("button");

    removeButton.className = "remove-button";
    removeButton.textContent = "×";


    removeButton.addEventListener(
        "click",
        function() {
            player.remove();
        }
    );


    /* 画面に追加 */
    player.appendChild(nameInput);
    player.appendChild(rankSelect);
    player.appendChild(spectatorDiv);
    player.appendChild(removeButton);

    playersElement.appendChild(player);
}


/*
 * チーム数を変更
 */
function updateTeamSizes() {

    teamSizesElement.innerHTML = "";

    const teamCount =
        Number(teamCountElement.value);


    for (let i = 0; i < teamCount; i++) {

        const div =
            document.createElement("div");

        div.className = "team-size";


        const label =
            document.createElement("label");

        label.textContent =
            "チーム"
            + String.fromCharCode(65 + i)
            + "：";


        const input =
            document.createElement("input");

        input.type = "number";
        input.min = "1";
        input.value = "1";

        input.className =
            "team-size-input";


        label.appendChild(input);
        div.appendChild(label);

        teamSizesElement.appendChild(div);
    }
}


/*
 * 参加者データを取得
 */
function getPlayers() {

    const playerElements =
        playersElement.querySelectorAll(".player");

    const players = [];


    for (let i = 0; i < playerElements.length; i++) {

        const nameInput =
            playerElements[i]
                .querySelector("input[type='text']");


        const rankSelect =
            playerElements[i]
                .querySelector("select");


        const spectatorCheck =
            playerElements[i]
                .querySelector(".spectator-check");


        const name =
            nameInput.value.trim();


        if (name === "") {
            continue;
        }


        const value =
            Number(rankSelect.value);


        let rankName = "";


        for (let j = 0; j < ranks.length; j++) {

            if (ranks[j].value === value) {

                rankName =
                    ranks[j].name;

                break;
            }
        }


        players.push({
            name: name,
            rankName: rankName,
            value: value,
            spectator: spectatorCheck.checked
        });
    }


    return players;
}


/*
 * チーム人数を取得
 */
function getTeamSizes() {

    const inputs =
        teamSizesElement
            .querySelectorAll(".team-size-input");

    const sizes = [];


    for (let i = 0; i < inputs.length; i++) {

        const size =
            Number(inputs[i].value);


        if (size < 1) {
            return null;
        }


        sizes.push(size);
    }


    return sizes;
}


/*
 * チーム間の実力差を計算
 */
function calculateDifference(teams) {

    let min =
        teams[0].total;

    let max =
        teams[0].total;


    for (let i = 1; i < teams.length; i++) {

        if (teams[i].total < min) {
            min = teams[i].total;
        }


        if (teams[i].total > max) {
            max = teams[i].total;
        }
    }


    return max - min;
}


/*
 * チーム分け
 */
function dividePlayers(players, teamSizes) {

    const teams = [];


    for (let i = 0; i < teamSizes.length; i++) {

        teams.push({
            players: [],
            total: 0,
            size: teamSizes[i]
        });
    }


    /*
     * 実力の高い順
     */
    const sortedPlayers =
    [...players];

sortedPlayers.sort(
    function(a, b) {

        if (b.value !== a.value) {
            return b.value - a.value;
        }

        return Math.random() - 0.5;
    }
);

    /*
     * 各チームに配置
     */
    for (let i = 0; i < sortedPlayers.length; i++) {

        let targetTeam = -1;


        for (let j = 0; j < teams.length; j++) {

            if (
                teams[j].players.length
                >= teams[j].size
            ) {
                continue;
            }


            if (targetTeam === -1) {

                targetTeam = j;

            } else if (
                teams[j].total
                < teams[targetTeam].total
            ) {

                targetTeam = j;
            }
        }


        if (targetTeam !== -1) {

            teams[targetTeam]
                .players
                .push(sortedPlayers[i]);


            teams[targetTeam].total +=
                sortedPlayers[i].value;
        }
    }


    /*
     * メンバー交換で実力差を小さくする
     */
    let changed = true;


    while (changed) {

        changed = false;


        let currentDifference =
            calculateDifference(teams);


        for (let a = 0; a < teams.length; a++) {

            for (
                let b = a + 1;
                b < teams.length;
                b++
            ) {

                for (
                    let i = 0;
                    i < teams[a].players.length;
                    i++
                ) {

                    for (
                        let j = 0;
                        j < teams[b].players.length;
                        j++
                    ) {

                        const playerA =
                            teams[a].players[i];


                        const playerB =
                            teams[b].players[j];


                        const oldTotalA =
                            teams[a].total;


                        const oldTotalB =
                            teams[b].total;


                        const newTotalA =
                            oldTotalA
                            - playerA.value
                            + playerB.value;


                        const newTotalB =
                            oldTotalB
                            - playerB.value
                            + playerA.value;


                        teams[a].total =
                            newTotalA;


                        teams[b].total =
                            newTotalB;


                        const newDifference =
                            calculateDifference(teams);


                        if (
                            newDifference
                            < currentDifference
                        ) {

                            teams[a]
                                .players[i] =
                                playerB;


                            teams[b]
                                .players[j] =
                                playerA;


                            currentDifference =
                                newDifference;


                            changed = true;

                        } else {

                            teams[a].total =
                                oldTotalA;


                            teams[b].total =
                                oldTotalB;
                        }
                    }
                }
            }
        }
    }


    return teams;
}


/*
 * 結果を表示
 */
function showResult(teams, spectators) {

    resultElement.innerHTML = "";


    /*
     * チーム表示
     */
    for (let i = 0; i < teams.length; i++) {

        const team =
            teams[i];


        const div =
            document.createElement("div");

        div.className =
            "result-team";


        const title =
            document.createElement("h3");


        title.textContent =
            "チーム"
            + String.fromCharCode(65 + i)
            + "（"
            + team.players.length
            + "人）";


        div.appendChild(title);


        /*
         * メンバー表示
         */
        for (
            let j = 0;
            j < team.players.length;
            j++
        ) {

            const player =
                team.players[j];


            const playerDiv =
                document.createElement("div");

            playerDiv.className =
                "player-result";


            const nameSpan =
                document.createElement("span");


            nameSpan.textContent =
                player.name;


            const rankSpan =
                document.createElement("span");


            rankSpan.textContent =
                player.rankName
                + " ("
                + player.value
                + ")";


            playerDiv.appendChild(nameSpan);
            playerDiv.appendChild(rankSpan);

            div.appendChild(playerDiv);
        }


        /*
         * 合計実力
         */
        const total =
            document.createElement("div");


        total.className =
            "total";


        total.textContent =
            "合計実力："
            + team.total;


        div.appendChild(total);

        resultElement.appendChild(div);
    }


    /*
     * 実力差
     */
    const difference =
        calculateDifference(teams);


    const differenceDiv =
        document.createElement("div");


    differenceDiv.className =
        "difference";


    differenceDiv.textContent =
        "チーム間の実力差："
        + difference;


    resultElement.appendChild(
        differenceDiv
    );


    /*
     * 観戦者
     */
    if (spectators.length > 0) {

        const spectatorTeam =
            document.createElement("div");


        spectatorTeam.className =
            "result-team";


        const spectatorTitle =
            document.createElement("h3");


        spectatorTitle.textContent =
            "👀 観戦";


        spectatorTeam.appendChild(
            spectatorTitle
        );


        for (
            let i = 0;
            i < spectators.length;
            i++
        ) {

            const player =
                spectators[i];


            const playerDiv =
                document.createElement("div");


            playerDiv.className =
                "player-result";


            const nameSpan =
                document.createElement("span");


            nameSpan.textContent =
                player.name;


            const rankSpan =
                document.createElement("span");


            rankSpan.textContent =
                player.rankName
                + " ("
                + player.value
                + ")";


            playerDiv.appendChild(nameSpan);
            playerDiv.appendChild(rankSpan);

            spectatorTeam.appendChild(
                playerDiv
            );
        }


        resultElement.appendChild(
            spectatorTeam
        );
    }


    resultSection.classList.remove(
        "hidden"
    );
}


/*
 * 参加者追加ボタン
 */
addPlayerButton.addEventListener(
    "click",
    addPlayer
);


/*
 * チーム数変更
 */
teamCountElement.addEventListener(
    "change",
    updateTeamSizes
);


/*
 * チーム分けボタン
 */
divideButton.addEventListener(
    "click",
    function() {

        const allPlayers =
            getPlayers();


        /*
         * 観戦者を除外
         */
        const players =
            allPlayers.filter(
                function(player) {
                    return !player.spectator;
                }
            );


        /*
         * 観戦者だけ取得
         */
        const spectators =
            allPlayers.filter(
                function(player) {
                    return player.spectator;
                }
            );


        const teamSizes =
            getTeamSizes();


        /*
         * 参加者がいない
         */
        if (players.length === 0) {

            alert(
                "チーム分けする参加者がいません。"
            );

            return;
        }


        /*
         * チーム人数チェック
         */
        if (teamSizes === null) {

            alert(
                "チーム人数を正しく入力してください。"
            );

            return;
        }


        /*
         * チーム人数の合計
         */
        let totalSize = 0;


        for (let i = 0; i < teamSizes.length; i++) {

            totalSize +=
                teamSizes[i];
        }


        /*
         * 人数が一致するか確認
         */
        if (totalSize !== players.length) {

            alert(
                "チーム人数の合計と参加者数が一致していません。\n"
                + "参加者："
                + players.length
                + "人\n"
                + "指定人数："
                + totalSize
                + "人"
            );

            return;
        }


        /*
         * チーム分け
         */
        const teams =
            dividePlayers(
                players,
                teamSizes
            );


        /*
         * 結果表示
         */
        showResult(
            teams,
            spectators
        );
    }
);


/*
 * 初期状態
 */
addPlayer();
addPlayer();

updateTeamSizes();

/*
 * 振り直しボタン
 */
redrawButton.addEventListener(
    "click",
    function() {

        const allPlayers =
            getPlayers();

        const players =
            allPlayers.filter(
                function(player) {
                    return !player.spectator;
                }
            );

        const spectators =
            allPlayers.filter(
                function(player) {
                    return player.spectator;
                }
            );

        const teamSizes =
            getTeamSizes();


        /*
         * まだチーム分けしていない場合
         */
        if (players.length === 0) {

            alert(
                "チーム分けする参加者がいません。"
            );

            return;
        }


        /*
         * チーム人数を確認
         */
        if (teamSizes === null) {

            alert(
                "チーム人数を正しく入力してください。"
            );

            return;
        }


        let totalSize = 0;

        for (let i = 0; i < teamSizes.length; i++) {

            totalSize +=
                teamSizes[i];
        }


        if (totalSize !== players.length) {

            alert(
                "チーム人数の合計と参加者数が一致していません。\n"
                + "参加者："
                + players.length
                + "人\n"
                + "指定人数："
                + totalSize
                + "人"
            );

            return;
        }


        /*
         * ランダムに並べ替える
         */
        players.sort(
            function() {
                return Math.random() - 0.5;
            }
        );


        /*
         * チーム分け
         */
        const teams =
            dividePlayers(
                players,
                teamSizes
            );


        /*
         * 結果表示
         */
        showResult(
            teams,
            spectators
        );
    }
);