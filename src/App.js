import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
function App() {
  ///// State 및 변수 시작 (useState, localStorage, redux, useSelector) /////

  // 사용자 입력후 이름 input으로 이동시키는 useRef
  const nameRef = useRef();

  // 계산기 on / off useState
  const [cal, setCal] = useState(false);

  // 하객리스트 중간 저장을 위한 useState
  const [list, setList] = useState({
    name: "",
    ticket: 0,
    amount: 0,
  });

  // 최종 하객 list useState
  const [finalList, setFinalList] = useState([]);

  // 하객리스트에 따른 계산된 금액 useState
  const [finalMoney, setFinalMoney] = useState([]);

  // 축의금 지폐 계산을 위한 지폐 useState
  const [paperMoney, setPaperMoney] = useState({
    chunMan: 0,
    backMan: 0,
    sipMan: 0,
    oMan: 0,
    man: 0,
    oChun: 0,
    chun: 0,
  });

  // 지폐장수 vs 명부리스트 계산금액 결과 멘트 useState
  const [result, setResult] = useState();

  // 지폐장수 vs 명부리스트 계산금액 결과 액수 useState
  const [resultCost, setResultCost] = useState(0);

  // 수정하는 값의 index번호와 null의 유무로 수정 중인지 감지 할 수 있는 useState
  const [editIndex, setEditIndex] = useState(null); // 상태를 통해 편집 중인 항목을 추적

  // 수정된 이름, 식권, 축의금 리스트 useState
  const [newName, setNewName] = useState();
  const [newTicket, setNewTicket] = useState();
  const [newAmount, setNewAmount] = useState();

  ///// State 및 변수 끝 (useState, localStorage, redux, useSelector) /////

  //--------------------------------------------------------------------------------//

  ///// Fn 시작 /////

  // 하객리스트 입력 handler Fn
  const listHandler = (e) => {
    const { name, value } = e.target;
    setList({ ...list, [name]: value });
  };

  // 입력된 지폐 hanlder Fn
  const calHandler = (e) => {
    const { name, value } = e.target;
    setPaperMoney({ ...paperMoney, [name]: value });
  };

  // 버튼 click Hanlder Fn
  const btnHanlder = (e) => {
    const { name, value } = e.target;
    if (name === "cal") {
      setCal(!cal);
      setFinalMoney([]);
      setResult("");
      setResultCost(0);
    } else if (name === "check") {
      setFinalMoney([paperMoney]);
      setPaperMoney({
        chunMan: 0,
        backMan: 0,
        sipMan: 0,
        oMan: 0,
        man: 0,
        oChun: 0,
        chun: 0,
      });

      // 명부와 비교 로직 추가
      const calculatedTotal = Number(
        paperMoney.chunMan * 10000000 +
          paperMoney.backMan * 1000000 +
          paperMoney.sipMan * 100000 +
          paperMoney.oMan * 50000 +
          paperMoney.man * 10000 +
          paperMoney.oChun * 5000 +
          paperMoney.chun * 1000
      );

      const totalFromFinalList = Number(
        finalList.reduce((total, el) => Number(total) + Number(el.amount), 0)
      );
      if (calculatedTotal > totalFromFinalList) {
        setResult("지폐계산기의 금액이 더 큽니다.");
        setResultCost(calculatedTotal - totalFromFinalList);
      } else if (calculatedTotal < totalFromFinalList) {
        setResult("명부(리스트)의 금액이 더 큽니다.");
        setResultCost(totalFromFinalList - calculatedTotal);
      } else {
        setResult("지폐계산기와 명부의 금액이 일치합니다.");
        setResultCost(0);
      }
    } else if (name === "reset") {
      setPaperMoney({
        chunMan: 0,
        backMan: 0,
        sipMan: 0,
        oMan: 0,
        man: 0,
        oChun: 0,
        chun: 0,
      });
      setFinalMoney([]);
      setResult("");
      setResultCost(0);
    } else {
      setFinalList([...finalList, list]);
      setList({
        name: "",
        ticket: 0,
        amount: 0,
      });
      nameRef.current.focus();
    }
  };

  // 삭제 버튼 Handler Fn
  const deleteHandler = (idx) => {
    finalList.filter((el, idx2) => {
      return idx !== idx2;
    });
    setFinalList(
      finalList.filter((el, idx2) => {
        return idx != idx2;
      })
    );
  };

  // 엔터 key 감지 Handler Fn
  const enterKeyHandler = (e) => {
    const key = e.code;
    if (key === "Enter" && e.nativeEvent.isComposing === false) {
      return btnHanlder(e);
    }
  };

  // 읽기 편한 금액으로 format바꿔주는 Fn
  function formatNumber(number) {
    const 천만 = Math.floor(number / 10000000);
    const 백만 = Math.floor((number % 10000000) / 1000000);
    const 만 = Math.floor((number % 1000000) / 10000);
    const 천 = Math.floor((number % 10000) / 1000);
    const 백 = Math.floor((number % 1000) / 100);

    let result = "";
    if (천만 > 0) {
      result += 천만 + "천";
    }
    if (백만 > 0) {
      result += 백만 + "백만 ";
    }
    if (만 > 0) {
      result += 만 + "만 ";
    }
    if (천 > 0) {
      result += 천 + "천 ";
    }
    if (백 > 0) {
      result += 백 + "백";
    }

    if (result === "") {
      result = "0";
    }

    return result + "원";
  }

  // 수정 당하는 row의 index를 추적하는 Handler Fn
  const handleEditClick = (index) => {
    // 편집 모드로전환 및 해당하는 인덱스에 저장
    setEditIndex(index);
  };

  // 저장 버튼 click시 저장 하는 Fn
  const handleSaveClick = (index, prevName, prevTicket, prevAmount) => {
    // finalList 배열을 복사
    const updatedFinalList = [...finalList];
    // // 새로운 이름을 해당 인덱스에 설정
    updatedFinalList[index].name = newName || prevName;
    updatedFinalList[index].ticket = newTicket || prevTicket;
    updatedFinalList[index].amount = newAmount || prevAmount;
    // // 수정된 finalList로 상태 업데이트
    setFinalList(updatedFinalList);
    // // 편집 모드 종료
    setEditIndex(null);
  };

  // 수정 Hanlder Fn
  const handleChange = (e, prev) => {
    const { name, value } = e.target;
    if (name === "nm") {
      setNewName(value || prev);
    } else if (name === "ticket") {
      setNewTicket(value || prev);
    } else {
      setNewAmount(value || prev);
    }
  };

  ///// Fn 끝 /////

  //--------------------------------------------------------------------------------//

  ///// useMemo 시작 /////

  // 수정모드의 감지를 통해서 수정 state 초기화 해주는 useMemo
  useMemo(() => {
    if (editIndex === null) {
      setNewAmount();
      setNewName();
      setNewTicket();
    }
  }, [editIndex]);

  ///// useMemo 끝 /////

  //--------------------------------------------------------------------------------//

  ///// useEffect 시작 /////

  // 새로고침 감지해서 Alert 띄워주는 useEffect
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // event 객체를 통해 사용자가 페이지를 떠나려 할 때 확인 메시지를 표시할 수 있습니다.
      event.preventDefault();
      event.returnValue = "새로고침을 하시면 하객명단이 전부 사라집니다!"; // 메시지를 원하는 내용으로 변경할 수 있습니다.
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  ///// useEffect 끝 /////

  //--------------------------------------------------------------------------------//

  ///// console.log 시작 /////

  ///// console.log 끝 ///////

  //--------------------------------------------------------------------------------//

  return (
    <div className="">
      {/* 이름, 식권, 축의금 input part */}
      <div className="flex gap-4 justify-center items-end m-14">
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text-alt">이름</span>
          </label>
          <input
            type="text"
            name="name"
            value={list.name || ""}
            placeholder="이름"
            ref={nameRef}
            onChange={listHandler}
            className="input input-bordered w-full max-w-xs"
          />
        </div>
        <div className="form-control w-20 max-w-xs">
          <label className="label">
            <span className="label-text-alt">식권</span>
          </label>
          <input
            type="number"
            name="ticket"
            value={list.ticket || ""}
            placeholder="식권"
            onChange={listHandler}
            className="input input-bordered w-full max-w-xs"
          />
        </div>
        <div className="form-control w-full max-w-xs">
          <label className="label">
            <span className="label-text-alt">금액</span>
          </label>
          <input
            type="number"
            name="amount"
            value={list.amount || ""}
            placeholder="금액"
            onChange={listHandler}
            onKeyDown={enterKeyHandler}
            className="input input-bordered w-full max-w-xs"
          />
        </div>

        {/* 입력, 계산기, pdf 저장 btn part */}
        <button className="btn" onClick={btnHanlder}>
          입력
        </button>
        <button name="cal" onClick={btnHanlder} className="btn">
          계산기 {cal ? "off" : "on"}
        </button>
        <button
          id="print"
          className="btn bg-blue-400"
          //다이나믹 임포트
          onClick={async () => {
            const onPureResultExcelDownload = (await import("./PrintPdf"))
              .default;
            await onPureResultExcelDownload("PDF", "축의금 현황");
          }}
        >
          PDF 저장
        </button>
      </div>

      {/* 지폐 계산 input part */}
      {cal ? (
        <div className="flex justify-center items-end gap-10">
          {/* 천만원 들어오면 오픈 */}
          <div className="flex justify-center items-center">
            <div className="form-control w-20 max-w-xs flex flex-col justify-center items-center">
              <label className="label">
                <span className="label-text-alt">1000만원권</span>
              </label>
              <input
                type="number"
                name="chunMan"
                value={paperMoney.chunMan || ""}
                className="input input-bordered w-full max-w-xs"
              />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="form-control w-20 max-w-xs  flex flex-col justify-center items-center">
              <label className="label">
                <span className="label-text-alt">100만원권</span>
              </label>
              <input
                type="number"
                name="backMan"
                value={paperMoney.backMan || ""}
                className="input input-bordered w-full max-w-xs"
                onChange={calHandler}
              />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="form-control w-20 max-w-xs flex flex-col justify-center items-center">
              <label className="label">
                <span className="label-text-alt">10만원권</span>
              </label>
              <input
                type="number"
                name="sipMan"
                value={paperMoney.sipMan || ""}
                className="input input-bordered w-full max-w-xs"
                onChange={calHandler}
              />
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="form-control w-20 max-w-xs flex flex-col justify-center items-center">
              <label className="label">
                <span className="label-text-alt">5만원권</span>
              </label>
              <input
                type="number"
                name="oMan"
                value={paperMoney.oMan || ""}
                className="input input-bordered w-full max-w-xs"
                onChange={calHandler}
              />
            </div>
          </div>
          <div className="form-control w-20 max-w-xs flex flex-col justify-center items-center">
            <label className="label">
              <span className="label-text-alt">1만원권</span>
            </label>
            <input
              type="number"
              name="man"
              onChange={calHandler}
              value={paperMoney.man || ""}
              className="input input-bordered w-full max-w-xs"
            />
          </div>
          <div className="flex justify-center items-center ">
            <div className="form-control w-20 max-w-xs flex flex-col justify-center items-center">
              <label className="label">
                <span className="label-text-alt">5000원권</span>
              </label>
              <input
                type="number"
                name="oChun"
                onChange={calHandler}
                value={paperMoney.oChun || ""}
                className="input input-bordered w-full max-w-xs"
              />
            </div>
          </div>
          {/* 천원짜리 들어오면 오픈 */}
          <div className="flex justify-center items-center">
            <div className="form-control w-20 max-w-xs  flex flex-col justify-center items-center">
              <label className="label">
                <span className="label-text-alt">1천원권</span>
              </label>
              <input
                type="number"
                name="chun"
                onChange={calHandler}
                value={paperMoney.chun || ""}
                className="input input-bordered w-full max-w-xs"
              />
            </div>
          </div>

          {/* 지폐 계산 btn part */}
          <button
            name="check"
            onClick={btnHanlder}
            className="btn justify-center "
          >
            계산하기
          </button>
          <button
            name="reset"
            onClick={btnHanlder}
            className="btn justify-center "
          >
            계산기 초기화
          </button>
        </div>
      ) : (
        <></>
      )}

      {/* 최종 하객리스트 요약 정보 part */}
      {finalList ? (
        <div
          id={"PDF"}
          className="overflow-x-auto w-full justify-center flex flex-col items-center "
        >
          <h4 className="font-bold text-5xl mt-12"> 하객 명단 </h4>

          <div className="flex gap-24 text-lg my-12">
            <div>
              {" "}
              방문객 : {finalList.filter((el) => el.amount !== 0).length} 명
            </div>
            <div>
              {" "}
              분출된 식권 :{" "}
              {Number(
                finalList.reduce(
                  (total, el) => Number(total) + Number(el.ticket),
                  0
                )
              )}{" "}
              장
            </div>
            <div>
              {" "}
              축의금 총액 :{" "}
              {Number(
                finalList.reduce(
                  (total, el) => Number(total) + Number(el.amount),
                  0
                )
              ).toLocaleString("en-US")}{" "}
              원
            </div>
          </div>
          <div className="flex justify-center items-center font-bold text-xl my-5">
            {" "}
            읽기편한 총액 :{" "}
            {formatNumber(
              Number(
                finalList.reduce(
                  (total, el) => Number(total) + Number(el.amount),
                  0
                )
              )
            )}{" "}
          </div>

          {/* 하객리스트와 명부리스트 금액 비교 part */}

          {finalMoney ? (
            <div className="flex justify-center items-center my-5">
              {finalMoney.map((el, idx) => {
                return (
                  <div
                    className="flex justify-center items-center gap-7"
                    key={idx}
                  >
                    {/* 천만원권 들어오면 오픈 */}
                    <div>천만원 {el.chunMan} : 장 </div>
                    <div>백만원 {el.backMan} : 장 </div>
                    <div> 십만원 {el.sipMan} : 장 </div>
                    <div> 오만원 {el.oMan} : 장 </div>
                    <div> 만원 {el.man} : 장 </div>
                    <div> 오천원 {el.oChun} : 장 </div>
                    {/* 천원권 들어오면 오픈 */}
                    <div>천원 {el.chun} : 장</div>

                    <div>
                      {" "}
                      총액{" "}
                      {(
                        Number(el.chunMan) * 10000000 +
                        Number(el.backMan) * 1000000 +
                        Number(el.sipMan) * 100000 +
                        Number(el.oMan) * 50000 +
                        Number(el.man) * 10000 +
                        Number(el.oChun) * 5000 +
                        Number(el.chun) * 1000
                      ).toLocaleString()}{" "}
                      원{" "}
                    </div>

                    {/* 명부와 계산기 비교 결과 div */}

                    <div
                      className={`${
                        resultCost === 0 ? "text-blue-400" : "text-red-500"
                      }`}
                    >
                      {result}
                    </div>

                    {resultCost !== 0 && (
                      <div>차액 : {resultCost.toLocaleString()} 원</div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <></>
          )}

          {/* 최종 하객리스트 테이블 part */}

          <table className="w-8/12 table items-center text-center my-20 text-lg">
            {/* head */}
            <thead className="text-center text-lg font-semibold">
              <tr>
                <th>번호</th>
                <th>하객명</th>
                <th>식권 몇 장</th>
                <th>금액</th>
                <th>비고 (수정/삭제)</th>
              </tr>
            </thead>
            <tbody className="text-center items-center ">
              {finalList
                .slice()
                .reverse()
                .map((el, idx, array) => {
                  const reversedIdx = array.length - idx - 1; // 역순으로 정렬된 idx 계산
                  return (
                    <tr
                      key={idx}
                      className={`${
                        editIndex !== null && editIndex === reversedIdx
                          ? "bg-slate-200 items-center"
                          : "items-center"
                      }`}
                    >
                      <th>{reversedIdx + 1}</th>
                      <th>
                        {editIndex !== null && editIndex === reversedIdx ? (
                          <input
                            type="text"
                            name="nm"
                            className=" border-2 border-red-400 rounded-lg"
                            defaultValue={el.name || newName}
                            onChange={(e) => handleChange(e, el.name)}
                          />
                        ) : (
                          el.name
                        )}
                      </th>
                      <th>
                        {editIndex !== null && editIndex === reversedIdx ? (
                          <input
                            className="w-24 border-2 border-blue-400 rounded-lg"
                            type="number"
                            name="ticket"
                            defaultValue={el.ticket || newTicket}
                            onChange={(e) => handleChange(e, el.ticket)}
                          />
                        ) : (
                          el.ticket
                        )}
                      </th>
                      <th>
                        {editIndex !== null && editIndex === reversedIdx ? (
                          <input
                            className="w-28 border-2 border-purple-400 rounded-lg"
                            type="number"
                            name="amount"
                            defaultValue={el.amount || newAmount}
                            onChange={(e) => handleChange(e, el.amount)}
                          />
                        ) : (
                          Number(el.amount).toLocaleString() + ` 원`
                        )}
                      </th>
                      <th className="flex justify-center gap-3" id={"noPdf"}>
                        {editIndex !== null && editIndex === reversedIdx ? (
                          <button
                            onClick={() =>
                              handleSaveClick(
                                reversedIdx,
                                el.name,
                                el.ticket,
                                el.amount
                              )
                            }
                          >
                            저장
                          </button>
                        ) : (
                          <div className="flex justify-center gap-3 items-center">
                            <img
                              onClick={() => handleEditClick(reversedIdx)}
                              className="w-7 h-7"
                              src="/update.png"
                              alt="update"
                            />
                            <img
                              onClick={() => deleteHandler(reversedIdx)}
                              className="w-7 h-7"
                              src="/x.png"
                              alt="x"
                            />
                          </div>
                        )}
                      </th>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
